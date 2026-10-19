package comparer

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
)

type ComparerModule struct {
	sdk    *jxscouttypes.ModuleSDK
	logger *slog.Logger
}

type CompareRequest struct {
	Projects []string `json:"projects"`
}

type ProjectComparison struct {
	Projects []ProjectStats        `json:"projects"`
	Common   []string              `json:"common_assets"`
	Unique   map[string][]string   `json:"unique_assets"`
}

type ProjectStats struct {
	Name              string         `json:"name"`
	TotalAssets       int            `json:"total_assets"`
	TotalFindings     int            `json:"total_findings"`
	SourcemapCoverage float64        `json:"sourcemap_coverage"`
	FindingsByType    map[string]int `json:"findings_by_type"`
	AssetsByType      map[string]int `json:"assets_by_type"`
}

func NewComparerModule() *ComparerModule {
	return &ComparerModule{}
}

func (m *ComparerModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.logger = sdk.Logger.With("module", "comparer")

	// Register REST API endpoint
	sdk.Router.Route("/api/compare", func(r chi.Router) {
		r.Post("/", m.handleCompare)
	})

	m.logger.Info("comparer module initialized")
	return nil
}

func (m *ComparerModule) handleCompare(w http.ResponseWriter, r *http.Request) {
	var req CompareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "Invalid request body", 400)
		return
	}

	if len(req.Projects) < 2 {
		m.sdk.HTTPServer.SendErrorResponse(w, "At least 2 projects required", 400)
		return
	}

	comparison, err := m.compareProjects(r.Context(), req.Projects)
	if err != nil {
		m.logger.Error("failed to compare projects", "error", err)
		m.sdk.HTTPServer.SendErrorResponse(w, "Failed to compare projects", 500)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, 200, comparison)
}

func (m *ComparerModule) compareProjects(ctx context.Context, projects []string) (*ProjectComparison, error) {
	comparison := &ProjectComparison{
		Projects: []ProjectStats{},
		Common:   []string{},
		Unique:   make(map[string][]string),
	}

	// Collect stats for each project
	allAssets := make(map[string]map[string]bool) // project -> URL set
	for _, project := range projects {
		stats, err := m.getProjectStats(ctx, project)
		if err != nil {
			return nil, errutil.Wrap(err, "failed to get project stats")
		}
		comparison.Projects = append(comparison.Projects, *stats)

		// Get asset URLs for overlap analysis
		urls, err := m.getProjectAssetURLs(ctx, project)
		if err != nil {
			return nil, err
		}
		allAssets[project] = make(map[string]bool)
		for _, url := range urls {
			allAssets[project][url] = true
		}
	}

	// Find common and unique assets
	if len(projects) >= 2 {
		// Common = assets in ALL projects
		firstProject := projects[0]
		for url := range allAssets[firstProject] {
			inAll := true
			for _, project := range projects[1:] {
				if !allAssets[project][url] {
					inAll = false
					break
				}
			}
			if inAll {
				comparison.Common = append(comparison.Common, url)
			}
		}

		// Unique = assets only in one project
		for _, project := range projects {
			comparison.Unique[project] = []string{}
			for url := range allAssets[project] {
				uniqueToThis := true
				for _, otherProject := range projects {
					if otherProject == project {
						continue
					}
					if allAssets[otherProject][url] {
						uniqueToThis = false
						break
					}
				}
				if uniqueToThis {
					comparison.Unique[project] = append(comparison.Unique[project], url)
				}
			}
		}
	}

	return comparison, nil
}

func (m *ComparerModule) getProjectStats(ctx context.Context, project string) (*ProjectStats, error) {
	stats := &ProjectStats{
		Name:           project,
		FindingsByType: make(map[string]int),
		AssetsByType:   make(map[string]int),
	}

	// Total assets
	err := m.sdk.Database.GetContext(ctx, &stats.TotalAssets,
		"SELECT COUNT(*) FROM assets WHERE project = ?", project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to count assets")
	}

	// Assets by content type
	rows, err := m.sdk.Database.QueryxContext(ctx, `
		SELECT content_type, COUNT(*) as count
		FROM assets WHERE project = ?
		GROUP BY content_type
	`, project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to count by type")
	}
	defer rows.Close()

	for rows.Next() {
		var contentType string
		var count int
		if err := rows.Scan(&contentType, &count); err != nil {
			continue
		}
		stats.AssetsByType[contentType] = count
	}

	// Findings by type
	findingsRows, err := m.sdk.Database.QueryxContext(ctx, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query findings")
	}
	defer findingsRows.Close()

	totalFindings := 0
	for findingsRows.Next() {
		var resultsJSON string
		if err := findingsRows.Scan(&resultsJSON); err != nil {
			continue
		}

		var results []map[string]any
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			analyzerName, _ := result["analyzerName"].(string)
			stats.FindingsByType[analyzerName]++
			totalFindings++
		}
	}
	stats.TotalFindings = totalFindings

	return stats, nil
}

func (m *ComparerModule) getProjectAssetURLs(ctx context.Context, project string) ([]string, error) {
	rows, err := m.sdk.Database.QueryxContext(ctx,
		"SELECT url FROM assets WHERE project = ?", project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query asset URLs")
	}
	defer rows.Close()

	var urls []string
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			continue
		}
		urls = append(urls, url)
	}

	return urls, nil
}
