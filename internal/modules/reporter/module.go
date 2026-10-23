package reporter

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
)

type ReporterModule struct {
	sdk    *jxscouttypes.ModuleSDK
	logger *slog.Logger
}

type ReportRequest struct {
	Project         string   `json:"project"`
	Format          string   `json:"format"` // pdf, html, json
	IncludeSections []string `json:"include_sections"`
}

type ReportData struct {
	Project            string
	GeneratedAt        time.Time
	TotalAssets        int
	TotalFindings      int
	SourcemapCoverage  float64
	FindingsBySeverity map[string]int
	Assets             []AssetSummary
	Findings           []FindingSummary
}

type AssetSummary struct {
	URL            string
	ContentType    string
	IsBeautified   bool
	IsOptimized    bool
	IsUnpacked     bool
	ScreenshotPath *string
}

type FindingSummary struct {
	AssetURL     string
	AnalyzerName string
	Value        string
	Line         int
}

func NewReporterModule() *ReporterModule {
	return &ReporterModule{}
}

func (m *ReporterModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.logger = sdk.Logger.With("module", "reporter")

	// Register REST API endpoint
	sdk.Router.Route("/api/reports", func(r chi.Router) {
		r.Post("/generate", m.handleGenerateReport)
	})

	m.logger.Info("reporter module initialized")
	return nil
}

func (m *ReporterModule) handleGenerateReport(w http.ResponseWriter, r *http.Request) {
	var req ReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "Invalid request body", 400)
		return
	}

	if req.Project == "" {
		m.sdk.HTTPServer.SendErrorResponse(w, "project parameter required", 400)
		return
	}

	if req.Format == "" {
		req.Format = "pdf"
	}

	reportData, err := m.collectReportData(r.Context(), req.Project)
	if err != nil {
		m.logger.Error("failed to collect report data", "error", err)
		m.sdk.HTTPServer.SendErrorResponse(w, "Failed to collect report data", 500)
		return
	}

	var outputPath string
	switch req.Format {
	case "pdf":
		outputPath, err = m.generatePDF(reportData)
	case "json":
		outputPath, err = m.generateJSON(reportData)
	case "html":
		outputPath, err = m.generateHTML(reportData)
	default:
		m.sdk.HTTPServer.SendErrorResponse(w, "Unsupported format", 400)
		return
	}

	if err != nil {
		m.logger.Error("failed to generate report", "format", req.Format, "error", err)
		m.sdk.HTTPServer.SendErrorResponse(w, "Failed to generate report", 500)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, 200, map[string]string{
		"output_path": outputPath,
		"format":      req.Format,
	})
}

func (m *ReporterModule) collectReportData(ctx context.Context, project string) (*ReportData, error) {
	data := &ReportData{
		Project:            project,
		GeneratedAt:        time.Now(),
		FindingsBySeverity: make(map[string]int),
	}

	// Count total assets
	err := m.sdk.Database.GetContext(ctx, &data.TotalAssets,
		"SELECT COUNT(*) FROM assets WHERE project = ?", project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to count assets")
	}

	// Get asset summaries
	rows, err := m.sdk.Database.QueryxContext(ctx, `
		SELECT url, content_type, is_beautified, is_optimized, is_unpacked, screenshot_path
		FROM assets WHERE project = ? LIMIT 100
	`, project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query assets")
	}
	defer rows.Close()

	for rows.Next() {
		var asset AssetSummary
		if err := rows.Scan(&asset.URL, &asset.ContentType, &asset.IsBeautified,
			&asset.IsOptimized, &asset.IsUnpacked, &asset.ScreenshotPath); err != nil {
			continue
		}
		data.Assets = append(data.Assets, asset)
	}

	// Get findings
	findingsRows, err := m.sdk.Database.QueryxContext(ctx, `
		SELECT a.url, aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
		LIMIT 500
	`, project)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query findings")
	}
	defer findingsRows.Close()

	for findingsRows.Next() {
		var assetURL, resultsJSON string
		if err := findingsRows.Scan(&assetURL, &resultsJSON); err != nil {
			continue
		}

		var results []map[string]any
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			analyzerName, _ := result["analyzerName"].(string)
			value, _ := result["value"].(string)

			finding := FindingSummary{
				AssetURL:     assetURL,
				AnalyzerName: analyzerName,
				Value:        value,
			}
			data.Findings = append(data.Findings, finding)
			data.FindingsBySeverity[analyzerName]++
		}
	}

	data.TotalFindings = len(data.Findings)

	return data, nil
}

func (m *ReporterModule) generatePDF(data *ReportData) (string, error) {
	reportsDir := filepath.Join(common.GetWorkingDirectory(data.Project), "reports")
	if err := os.MkdirAll(reportsDir, 0755); err != nil {
		return "", errutil.Wrap(err, "failed to create reports directory")
	}

	outputPath := filepath.Join(reportsDir, fmt.Sprintf("report_%s.pdf", time.Now().Format("20060102_150405")))

	lines := []string{
		fmt.Sprintf("JXScout Report - %s", data.Project),
		fmt.Sprintf("Generated: %s", data.GeneratedAt.Format(time.RFC3339)),
		"",
		"=== Summary ===",
		fmt.Sprintf("Total Assets: %d", data.TotalAssets),
		fmt.Sprintf("Total Findings: %d", data.TotalFindings),
		"",
		"=== Findings by Analyzer ===",
	}

	analyzers := make([]string, 0, len(data.FindingsBySeverity))
	for analyzer := range data.FindingsBySeverity {
		analyzers = append(analyzers, analyzer)
	}
	sort.Strings(analyzers)
	for _, analyzer := range analyzers {
		lines = append(lines, fmt.Sprintf("%s: %d", analyzer, data.FindingsBySeverity[analyzer]))
	}

	if err := os.WriteFile(outputPath, buildPDF(lines), 0644); err != nil {
		return "", errutil.Wrap(err, "failed to write PDF report")
	}

	return outputPath, nil
}

func (m *ReporterModule) generateJSON(data *ReportData) (string, error) {
	reportsDir := filepath.Join(common.GetWorkingDirectory(data.Project), "reports")
	if err := os.MkdirAll(reportsDir, 0755); err != nil {
		return "", errutil.Wrap(err, "failed to create reports directory")
	}

	outputPath := filepath.Join(reportsDir, fmt.Sprintf("report_%s.json", time.Now().Format("20060102_150405")))

	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return "", errutil.Wrap(err, "failed to marshal JSON")
	}

	if err := os.WriteFile(outputPath, jsonData, 0644); err != nil {
		return "", errutil.Wrap(err, "failed to write JSON file")
	}

	return outputPath, nil
}

func (m *ReporterModule) generateHTML(data *ReportData) (string, error) {
	reportsDir := filepath.Join(common.GetWorkingDirectory(data.Project), "reports")
	if err := os.MkdirAll(reportsDir, 0755); err != nil {
		return "", errutil.Wrap(err, "failed to create reports directory")
	}

	outputPath := filepath.Join(reportsDir, fmt.Sprintf("report_%s.html", time.Now().Format("20060102_150405")))

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
	<title>JXScout Report - %s</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 40px; }
		h1 { color: #333; }
		.summary { background: #f5f5f5; padding: 20px; margin: 20px 0; }
		.finding { border-left: 3px solid #007bff; padding: 10px; margin: 10px 0; }
	</style>
</head>
<body>
	<h1>JXScout Report - %s</h1>
	<p>Generated: %s</p>
	<div class="summary">
		<h2>Summary</h2>
		<p>Total Assets: %d</p>
		<p>Total Findings: %d</p>
	</div>
	<h2>Findings by Analyzer</h2>
	<ul>`,
		data.Project, data.Project, data.GeneratedAt.Format(time.RFC3339),
		data.TotalAssets, data.TotalFindings)

	for analyzer, count := range data.FindingsBySeverity {
		html += fmt.Sprintf("<li>%s: %d</li>", analyzer, count)
	}

	html += `
	</ul>
</body>
</html>`

	if err := os.WriteFile(outputPath, []byte(html), 0644); err != nil {
		return "", errutil.Wrap(err, "failed to write HTML file")
	}

	return outputPath, nil
}
