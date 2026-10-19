package differ

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
)

type DifferModule struct {
	sdk    *jxscouttypes.ModuleSDK
	logger *slog.Logger
}

type DiffRequest struct {
	Project1 string `json:"project1"`
	Project2 string `json:"project2"`
	ASTMode  bool   `json:"ast_mode"`
}

type ProjectDiff struct {
	Added     []AssetDiff `json:"added"`
	Removed   []AssetDiff `json:"removed"`
	Modified  []AssetDiff `json:"modified"`
	Unchanged int         `json:"unchanged"`
}

type AssetDiff struct {
	URL         string  `json:"url"`
	OldHash     *string `json:"old_hash,omitempty"`
	NewHash     *string `json:"new_hash,omitempty"`
	ContentType string  `json:"content_type"`
}

func NewDifferModule() *DifferModule {
	return &DifferModule{}
}

func (m *DifferModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.logger = sdk.Logger.With("module", "differ")

	// Register REST API endpoint
	sdk.Router.Route("/api/diff", func(r chi.Router) {
		r.Post("/", m.handleDiff)
	})

	m.logger.Info("differ module initialized")
	return nil
}

func (m *DifferModule) handleDiff(w http.ResponseWriter, r *http.Request) {
	var req DiffRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "Invalid request body", 400)
		return
	}

	if req.Project1 == "" || req.Project2 == "" {
		m.sdk.HTTPServer.SendErrorResponse(w, "project1 and project2 parameters required", 400)
		return
	}

	diff, err := m.computeDiff(r.Context(), req.Project1, req.Project2, req.ASTMode)
	if err != nil {
		m.logger.Error("failed to compute diff", "error", err)
		m.sdk.HTTPServer.SendErrorResponse(w, "Failed to compute diff", 500)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, 200, diff)
}

func (m *DifferModule) computeDiff(ctx context.Context, project1, project2 string, astMode bool) (*ProjectDiff, error) {
	// Get assets from both projects
	assets1, err := m.getProjectAssets(ctx, project1)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to get project1 assets")
	}

	assets2, err := m.getProjectAssets(ctx, project2)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to get project2 assets")
	}

	// Build URL -> Asset maps
	map1 := make(map[string]AssetDiff)
	for _, asset := range assets1 {
		map1[asset.URL] = asset
	}

	map2 := make(map[string]AssetDiff)
	for _, asset := range assets2 {
		map2[asset.URL] = asset
	}

	diff := &ProjectDiff{
		Added:    []AssetDiff{},
		Removed:  []AssetDiff{},
		Modified: []AssetDiff{},
	}

	// Find added and modified
	for url, asset2 := range map2 {
		asset1, exists := map1[url]
		if !exists {
			// Asset exists in project2 but not project1 = ADDED
			diff.Added = append(diff.Added, asset2)
		} else {
			// Asset exists in both - check if modified
			if asset1.NewHash != nil && asset2.NewHash != nil && *asset1.NewHash != *asset2.NewHash {
				modified := AssetDiff{
					URL:         url,
					OldHash:     asset1.NewHash,
					NewHash:     asset2.NewHash,
					ContentType: asset2.ContentType,
				}
				diff.Modified = append(diff.Modified, modified)
			} else if asset1.NewHash == asset2.NewHash {
				diff.Unchanged++
			}
		}
	}

	// Find removed
	for url, asset1 := range map1 {
		if _, exists := map2[url]; !exists {
			// Asset exists in project1 but not project2 = REMOVED
			diff.Removed = append(diff.Removed, asset1)
		}
	}

	return diff, nil
}

func (m *DifferModule) getProjectAssets(ctx context.Context, project string) ([]AssetDiff, error) {
	rows, err := m.sdk.Database.QueryxContext(ctx, `
		SELECT url, content_hash, content_type
		FROM assets WHERE project = ?
	`, project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query assets")
	}
	defer rows.Close()

	var assets []AssetDiff
	for rows.Next() {
		var url, contentHash, contentType string
		if err := rows.Scan(&url, &contentHash, &contentType); err != nil {
			continue
		}

		assets = append(assets, AssetDiff{
			URL:         url,
			NewHash:     &contentHash,
			ContentType: contentType,
		})
	}

	return assets, nil
}

// DiffAssets compares two assets and returns detailed changes
func (m *DifferModule) DiffAssets(ctx context.Context, asset1URL, asset2URL string) (map[string]any, error) {
	// Read both assets
	content1, err := m.getAssetContent(ctx, asset1URL)
	if err != nil {
		return nil, err
	}

	content2, err := m.getAssetContent(ctx, asset2URL)
	if err != nil {
		return nil, err
	}

	// Simple hash-based comparison
	hash1 := sha256.Sum256([]byte(content1))
	hash2 := sha256.Sum256([]byte(content2))

	return map[string]any{
		"asset1":    asset1URL,
		"asset2":    asset2URL,
		"hash1":     hex.EncodeToString(hash1[:]),
		"hash2":     hex.EncodeToString(hash2[:]),
		"identical": hash1 == hash2,
		"size1":     len(content1),
		"size2":     len(content2),
	}, nil
}

func (m *DifferModule) getAssetContent(ctx context.Context, assetURL string) (string, error) {
	var fsPath string
	err := m.sdk.Database.GetContext(ctx, &fsPath,
		"SELECT fs_path FROM assets WHERE url = ?", assetURL)
	if err != nil {
		return "", errutil.Wrap(err, fmt.Sprintf("asset not found: %s", assetURL))
	}

	// Read directly from filesystem
	content, err := os.ReadFile(fsPath)
	if err != nil {
		return "", errutil.Wrap(err, "failed to read asset file")
	}

	return string(content), nil
}
