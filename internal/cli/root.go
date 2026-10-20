package cli

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/database"
	"github.com/francisconeves97/jxscout/internal/core/findings"
	monitoring "github.com/francisconeves97/jxscout/internal/modules/monitoring"
	"github.com/francisconeves97/jxscout/internal/settings"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/spf13/cobra"
)

var (
	projectName  string
	outputFormat string
)

var rootCmd = &cobra.Command{
	Use:   "jxscout-cli",
	Short: "JXScout headless CLI utilities",
	Long:  "Headless command-line utilities for querying JXScout data without running the proxy server",
}

// Execute runs the root command
func Execute() error {
	return rootCmd.Execute()
}

// RegisterCommands exports CLI commands for main binary integration
func RegisterCommands(parent *cobra.Command) {
	parent.AddCommand(wordlistCmd)
	parent.AddCommand(queryCmd)
	parent.AddCommand(fsIngestCmd)
	parent.AddCommand(backupCmd)
	parent.AddCommand(createFindingCmd)
	parent.AddCommand(listFindingsCmd)
	parent.AddCommand(printFullSettingsCmd)
	parent.AddCommand(repeaterCmd)
	parent.AddCommand(monitorCmd)
}

func init() {
	rootCmd.PersistentFlags().StringVarP(&projectName, "project", "p", "default", "project name")
	rootCmd.PersistentFlags().StringVarP(&outputFormat, "output", "o", "text", "output format (text, json)")
}

// Wordlist command
var wordlistCmd = &cobra.Command{
	Use:   "wordlist",
	Short: "Extract wordlists from analyzed assets",
	Long:  "Generate sorted wordlists of paths, secrets, parameters, and packages for fuzzing/testing",
	RunE:  runWordlist,
}

var (
	wordlistType string
	unique       bool
)

func init() {
	wordlistCmd.Flags().StringVarP(&wordlistType, "type", "t", "paths", "wordlist type: paths, secrets, params, packages, all")
	wordlistCmd.Flags().BoolVarP(&unique, "unique", "u", true, "deduplicate entries")
	rootCmd.AddCommand(wordlistCmd)
}

func runWordlist(cmd *cobra.Command, args []string) error {
	ctx := context.Background()
	dbPath := filepath.Join(common.GetPrivateDirectory(projectName), "db", "db.sql")

	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	switch wordlistType {
	case "paths":
		return extractPaths(ctx, db)
	case "secrets":
		return extractSecrets(ctx, db)
	case "params":
		return extractParams(ctx, db)
	case "packages":
		return extractPackages(ctx, db)
	case "all":
		fmt.Println("# Paths")
		if err := extractPaths(ctx, db); err != nil {
			return err
		}
		fmt.Println("\n# Secrets")
		if err := extractSecrets(ctx, db); err != nil {
			return err
		}
		fmt.Println("\n# Parameters")
		if err := extractParams(ctx, db); err != nil {
			return err
		}
		fmt.Println("\n# Packages")
		return extractPackages(ctx, db)
	default:
		return fmt.Errorf("unknown wordlist type: %s", wordlistType)
	}
}

func extractPaths(ctx context.Context, db *sqlx.DB) error {
	var assets []struct {
		URL string `db:"url"`
	}
	err := db.SelectContext(ctx, &assets, "SELECT url FROM assets WHERE project = ?", projectName)
	if err != nil {
		return fmt.Errorf("failed to query assets: %w", err)
	}

	pathSet := make(map[string]bool)
	for _, asset := range assets {
		// Extract path segments
		parts := strings.Split(asset.URL, "/")
		for _, part := range parts {
			if part != "" && part != "http:" && part != "https:" {
				pathSet[part] = true
			}
		}
	}

	return printWordlist(pathSet)
}

func extractSecrets(ctx context.Context, db *sqlx.DB) error {
	// Query AST analysis results for secrets
	rows, err := db.QueryContext(ctx, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, projectName)
	if err != nil {
		return fmt.Errorf("failed to query ast analysis: %w", err)
	}
	defer rows.Close()

	secretSet := make(map[string]bool)
	for rows.Next() {
		var resultsJSON string
		if err := rows.Scan(&resultsJSON); err != nil {
			continue
		}

		var results []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			if typ, ok := result["analyzerName"].(string); ok && typ == "secrets" {
				if match, ok := result["value"].(string); ok {
					secretSet[match] = true
				}
			}
		}
	}

	return printWordlist(secretSet)
}

func extractParams(ctx context.Context, db *sqlx.DB) error {
	rows, err := db.QueryContext(ctx, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, projectName)
	if err != nil {
		return fmt.Errorf("failed to query ast analysis: %w", err)
	}
	defer rows.Close()

	paramSet := make(map[string]bool)
	for rows.Next() {
		var resultsJSON string
		if err := rows.Scan(&resultsJSON); err != nil {
			continue
		}

		var results []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			if typ, ok := result["analyzerName"].(string); ok && typ == "url-search-params" {
				if match, ok := result["value"].(string); ok {
					paramSet[match] = true
				}
			}
		}
	}

	return printWordlist(paramSet)
}

func extractPackages(ctx context.Context, db *sqlx.DB) error {
	rows, err := db.QueryContext(ctx, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, projectName)
	if err != nil {
		return fmt.Errorf("failed to query ast analysis: %w", err)
	}
	defer rows.Close()

	packageSet := make(map[string]bool)
	for rows.Next() {
		var resultsJSON string
		if err := rows.Scan(&resultsJSON); err != nil {
			continue
		}

		var results []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			if typ, ok := result["analyzerName"].(string); ok && typ == "dependency-confusion" {
				if match, ok := result["value"].(string); ok {
					packageSet[match] = true
				}
			}
		}
	}

	return printWordlist(packageSet)
}

func printWordlist(items map[string]bool) error {
	if outputFormat == "json" {
		list := make([]string, 0, len(items))
		for item := range items {
			list = append(list, item)
		}
		sort.Strings(list)
		return json.NewEncoder(os.Stdout).Encode(list)
	}

	// Text format - one per line, sorted
	list := make([]string, 0, len(items))
	for item := range items {
		list = append(list, item)
	}
	sort.Strings(list)

	for _, item := range list {
		fmt.Println(item)
	}

	return nil
}

// Query command
var queryCmd = &cobra.Command{
	Use:   "query",
	Short: "Query assets and analysis results",
	Long:  "Export assets, findings, and descriptors as JSON",
	RunE:  runQuery,
}

var (
	queryType string
	assetURL  string
	limit     int
)

func init() {
	queryCmd.Flags().StringVarP(&queryType, "type", "t", "assets", "query type: assets, descriptors, findings")
	queryCmd.Flags().StringVarP(&assetURL, "url", "", "", "filter by asset URL (exact match)")
	queryCmd.Flags().IntVarP(&limit, "limit", "l", 100, "limit results")
	rootCmd.AddCommand(queryCmd)
}

func runQuery(cmd *cobra.Command, args []string) error {
	ctx := context.Background()
	dbPath := filepath.Join(common.GetPrivateDirectory(projectName), "db", "db.sql")

	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	switch queryType {
	case "assets":
		return queryAssets(ctx, db)
	case "descriptors":
		return queryDescriptors(ctx, db)
	case "findings":
		return queryFindings(ctx, db)
	default:
		return fmt.Errorf("unknown query type: %s", queryType)
	}
}

func queryAssets(ctx context.Context, db *sqlx.DB) error {
	query := "SELECT id, url, content_hash, content_type, fs_path, project, request_headers, created_at, updated_at, is_inline_js, is_chunk_discovered, chunk_from_asset_id, is_beautified FROM assets WHERE project = ?"
	args := []interface{}{projectName}

	if assetURL != "" {
		query += " AND url = ?"
		args = append(args, assetURL)
	}

	query += " LIMIT ?"
	args = append(args, limit)

	var assets []struct {
		ID                int64   `db:"id"`
		URL               string  `db:"url"`
		ContentHash       string  `db:"content_hash"`
		ContentType       string  `db:"content_type"`
		FileSystemPath    string  `db:"fs_path"`
		Project           string  `db:"project"`
		RequestHeaders    *string `db:"request_headers"`
		CreatedAt         *string `db:"created_at"`
		UpdatedAt         *string `db:"updated_at"`
		IsInlineJS        bool    `db:"is_inline_js"`
		IsChunkDiscovered *bool   `db:"is_chunk_discovered"`
		ChunkFromAssetID  *int64  `db:"chunk_from_asset_id"`
		IsBeautified      bool    `db:"is_beautified"`
	}
	err := db.SelectContext(ctx, &assets, query, args...)
	if err != nil {
		return fmt.Errorf("failed to query assets: %w", err)
	}

	return json.NewEncoder(os.Stdout).Encode(assets)
}

func queryDescriptors(ctx context.Context, db *sqlx.DB) error {
	query := `
		SELECT a.url, aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`
	args := []interface{}{projectName}

	if assetURL != "" {
		query += " AND a.url = ?"
		args = append(args, assetURL)
	}

	query += " LIMIT ?"
	args = append(args, limit)

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to query descriptors: %w", err)
	}
	defer rows.Close()

	type Result struct {
		URL         string                   `json:"url"`
		Descriptors []map[string]interface{} `json:"descriptors"`
	}

	results := []Result{}
	for rows.Next() {
		var url, resultsJSON string
		if err := rows.Scan(&url, &resultsJSON); err != nil {
			continue
		}

		var descriptors []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &descriptors); err != nil {
			continue
		}

		results = append(results, Result{URL: url, Descriptors: descriptors})
	}

	return json.NewEncoder(os.Stdout).Encode(results)
}

func queryFindings(ctx context.Context, db *sqlx.DB) error {
	query := `
		SELECT a.url, aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`
	args := []interface{}{projectName}

	if assetURL != "" {
		query += " AND a.url = ?"
		args = append(args, assetURL)
	}

	query += " LIMIT ?"
	args = append(args, limit)

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to query findings: %w", err)
	}
	defer rows.Close()

	type Finding struct {
		URL  string                 `json:"url"`
		Type string                 `json:"type"`
		Data map[string]interface{} `json:"data"`
	}

	findings := []Finding{}
	for rows.Next() {
		var url, resultsJSON string
		if err := rows.Scan(&url, &resultsJSON); err != nil {
			continue
		}

		var results []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			if typ, ok := result["type"].(string); ok {
				findings = append(findings, Finding{
					URL:  url,
					Type: typ,
					Data: result,
				})
			}
		}
	}

	return json.NewEncoder(os.Stdout).Encode(findings)
}

// Fs-ingest command
var fsIngestCmd = &cobra.Command{
	Use:   "fs-ingest [path]",
	Short: "Ingest local files/folders into project",
	Long:  "Recursively ingest JavaScript and HTML files from filesystem without proxy",
	Args:  cobra.ExactArgs(1),
	RunE:  runFsIngest,
}

var (
	recursive  bool
	extensions []string
)

func init() {
	fsIngestCmd.Flags().BoolVarP(&recursive, "recursive", "r", true, "recursively scan directories")
	fsIngestCmd.Flags().StringSliceVarP(&extensions, "ext", "e", []string{".js", ".html", ".htm"}, "file extensions to ingest")
	rootCmd.AddCommand(fsIngestCmd)
}

func runFsIngest(cmd *cobra.Command, args []string) error {
	ctx := context.Background()
	path := args[0]

	info, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("failed to stat path: %w", err)
	}

	files := []string{}

	if info.IsDir() {
		if recursive {
			err = filepath.Walk(path, func(fp string, fi os.FileInfo, err error) error {
				if err != nil {
					return err
				}
				if !fi.IsDir() && hasExtension(fp, extensions) {
					files = append(files, fp)
				}
				return nil
			})
		} else {
			entries, err := os.ReadDir(path)
			if err != nil {
				return fmt.Errorf("failed to read directory: %w", err)
			}
			for _, entry := range entries {
				if !entry.IsDir() {
					fp := filepath.Join(path, entry.Name())
					if hasExtension(fp, extensions) {
						files = append(files, fp)
					}
				}
			}
		}
	} else {
		files = append(files, path)
	}

	if err != nil {
		return fmt.Errorf("failed to walk directory: %w", err)
	}

	fmt.Printf("Found %d files to ingest\n", len(files))

	dbPath := filepath.Join(common.GetPrivateDirectory(projectName), "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	projectDir := common.GetWorkingDirectory(projectName)
	ingestDir := filepath.Join(projectDir, "original")

	if err := os.MkdirAll(ingestDir, 0755); err != nil {
		return fmt.Errorf("failed to create ingest directory: %w", err)
	}

	ingested := 0
	for i, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to read %s: %v\n", file, err)
			continue
		}

		relPath, _ := filepath.Rel(path, file)
		if relPath == "" || strings.HasPrefix(relPath, "..") {
			relPath = filepath.Base(file)
		}

		fakeURL := fmt.Sprintf("file://localhost/%s", strings.ReplaceAll(relPath, "\\", "/"))
		contentHash := common.Hash(string(content))

		var exists int
		err = db.GetContext(ctx, &exists, "SELECT 1 FROM assets WHERE url = ? LIMIT 1", fakeURL)
		if err == nil {
			continue
		}

		destPath := filepath.Join(ingestDir, "localhost", relPath)
		if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to create directory for %s: %v\n", destPath, err)
			continue
		}

		if err := os.WriteFile(destPath, content, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to write %s: %v\n", destPath, err)
			continue
		}

		contentType := "JS"
		if strings.HasSuffix(strings.ToLower(file), ".html") || strings.HasSuffix(strings.ToLower(file), ".htm") {
			contentType = "HTML"
		}

		_, err = db.ExecContext(ctx, `
			INSERT INTO assets (url, content_hash, content_type, fs_path, project, request_headers, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`, fakeURL, contentHash, contentType, destPath, projectName)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to insert asset %s: %v\n", fakeURL, err)
			continue
		}

		var assetID int64
		err = db.GetContext(ctx, &assetID, "SELECT id FROM assets WHERE url = ?", fakeURL)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to get asset ID for %s: %v\n", fakeURL, err)
			continue
		}

		_, err = db.ExecContext(ctx, `
			INSERT INTO events (name, payload) VALUES ('asset_service.asset_saved', ?)
		`, fmt.Sprintf(`{"asset_id":%d}`, assetID))
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: failed to publish event for %s: %v\n", fakeURL, err)
		}

		ingested++
		if (i+1)%100 == 0 {
			fmt.Printf("Ingested %d/%d files...\n", ingested, len(files))
		}
	}

	fmt.Printf("Successfully ingested %d files. Events published for background processing.\n", ingested)
	fmt.Println("Run jxscout proxy (or wait for background workers if already running) to analyze.")

	return nil
}

func hasExtension(path string, exts []string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	for _, e := range exts {
		if ext == strings.ToLower(e) {
			return true
		}
	}
	return false
}

// Backup command
var backupCmd = &cobra.Command{
	Use:   "backup [output-file]",
	Short: "Backup project to archive",
	Long:  "Create compressed archive of project database and assets (supports >4GB projects)",
	Args:  cobra.ExactArgs(1),
	RunE:  runBackup,
}

func init() {
	rootCmd.AddCommand(backupCmd)
}

func runBackup(cmd *cobra.Command, args []string) error {
	outputFile := args[0]

	projectDir := common.GetPrivateDirectory(projectName)
	workingDir := common.GetWorkingDirectory(projectName)

	if _, err := os.Stat(projectDir); os.IsNotExist(err) {
		return fmt.Errorf("project %s does not exist", projectName)
	}

	fmt.Printf("Starting backup of project '%s'...\n", projectName)
	fmt.Printf("Source: %s\n", projectDir)
	fmt.Printf("Assets: %s\n", workingDir)
	fmt.Printf("Output: %s\n", outputFile)

	// Use tar + gzip streaming for memory efficiency with large projects
	outFile, err := os.Create(outputFile)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	gzipWriter := gzip.NewWriter(outFile)
	defer gzipWriter.Close()

	tarWriter := tar.NewWriter(gzipWriter)
	defer tarWriter.Close()

	totalSize := int64(0)
	fileCount := 0

	// Backup project metadata and database
	err = filepath.Walk(projectDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(projectDir, path)
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(info, "")
		if err != nil {
			return err
		}
		header.Name = filepath.Join("project", relPath)

		if err := tarWriter.WriteHeader(header); err != nil {
			return err
		}

		if !info.IsDir() {
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()

			written, err := io.Copy(tarWriter, file)
			if err != nil {
				return err
			}
			totalSize += written
			fileCount++

			if fileCount%1000 == 0 {
				fmt.Printf("Backed up %d files (%.2f MB)...\n", fileCount, float64(totalSize)/(1024*1024))
			}
		}

		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to backup project directory: %w", err)
	}

	// Backup assets (original, beautified, etc.)
	if _, err := os.Stat(workingDir); err == nil {
		err = filepath.Walk(workingDir, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			relPath, err := filepath.Rel(workingDir, path)
			if err != nil {
				return err
			}

			header, err := tar.FileInfoHeader(info, "")
			if err != nil {
				return err
			}
			header.Name = filepath.Join("assets", relPath)

			if err := tarWriter.WriteHeader(header); err != nil {
				return err
			}

			if !info.IsDir() {
				file, err := os.Open(path)
				if err != nil {
					return err
				}
				defer file.Close()

				written, err := io.Copy(tarWriter, file)
				if err != nil {
					return err
				}
				totalSize += written
				fileCount++

				if fileCount%1000 == 0 {
					fmt.Printf("Backed up %d files (%.2f MB)...\n", fileCount, float64(totalSize)/(1024*1024))
				}
			}

			return nil
		})
		if err != nil {
			return fmt.Errorf("failed to backup assets directory: %w", err)
		}
	}

	fmt.Printf("\nBackup complete!\n")
	fmt.Printf("Files: %d\n", fileCount)
	fmt.Printf("Uncompressed size: %.2f MB\n", float64(totalSize)/(1024*1024))

	outFileInfo, _ := os.Stat(outputFile)
	fmt.Printf("Archive size: %.2f MB\n", float64(outFileInfo.Size())/(1024*1024))
	fmt.Printf("Compression ratio: %.1f%%\n", (1.0-float64(outFileInfo.Size())/float64(totalSize))*100)

	return nil
}

// Findings commands (Pro v2 findings feature)
var createFindingCmd = &cobra.Command{
	Use:   "create-finding",
	Short: "Create a structured security finding",
	Long:  "Create a finding with kind/severity/description, deduplicated on kind+dedup-key. Publishes the finding_created hook event.",
	RunE:  runCreateFinding,
}

var listFindingsCmd = &cobra.Command{
	Use:   "list-findings",
	Short: "List structured security findings",
	RunE:  runListFindings,
}

var (
	findingKind        string
	findingSeverity    string
	findingDescription string
	findingDedupKey    string
	findingMetadata    string
	findingFilterKind  string
	findingFilterSev   string
	findingLimit       int
	findingOffset      int
)

func init() {
	createFindingCmd.Flags().StringVar(&findingKind, "kind", "", "finding type (e.g. secret, pii, vulnerability, idor, xss)")
	createFindingCmd.Flags().StringVar(&findingSeverity, "severity", "", "severity: low|medium|high|critical")
	createFindingCmd.Flags().StringVar(&findingDescription, "description", "", "human-readable description")
	createFindingCmd.Flags().StringVar(&findingDedupKey, "dedup-key", "", "deduplication key (same kind+key returns existing)")
	createFindingCmd.Flags().StringVar(&findingMetadata, "metadata", "", "JSON object with extra data (e.g. file_path, url)")

	listFindingsCmd.Flags().StringVar(&findingFilterKind, "kind", "", "filter by kind")
	listFindingsCmd.Flags().StringVar(&findingFilterSev, "severity", "", "filter by severity")
	listFindingsCmd.Flags().IntVar(&findingLimit, "limit", 50, "max results")
	listFindingsCmd.Flags().IntVar(&findingOffset, "offset", 0, "result offset")

	rootCmd.AddCommand(createFindingCmd)
	rootCmd.AddCommand(listFindingsCmd)
}

func openProjectDB() (*sqlx.DB, error) {
	return database.GetDatabase(projectName)
}

func runCreateFinding(cmd *cobra.Command, args []string) error {
	db, err := openProjectDB()
	if err != nil {
		return err
	}
	defer db.Close()

	if err := findings.InitializeTable(db); err != nil {
		return fmt.Errorf("failed to initialize findings table: %w", err)
	}

	id, deduped, err := findings.Create(context.Background(), db, findings.CreateRequest{
		Kind:        findingKind,
		Severity:    findingSeverity,
		Description: findingDescription,
		DedupKey:    findingDedupKey,
		Metadata:    findingMetadata,
	})
	if err != nil {
		return err
	}

	result := map[string]any{
		"success":    !deduped,
		"finding_id": id,
		"message":    "Finding created with ID: " + fmt.Sprint(id),
	}
	if deduped {
		result["finding_id"] = nil
		result["message"] = "Finding was deduplicated (already exists)"
	}

	return printResult(result)
}

func runListFindings(cmd *cobra.Command, args []string) error {
	db, err := openProjectDB()
	if err != nil {
		return err
	}
	defer db.Close()

	if err := findings.InitializeTable(db); err != nil {
		return fmt.Errorf("failed to initialize findings table: %w", err)
	}

	items, total, err := findings.List(context.Background(), db, findingFilterSev, findingFilterKind, findingLimit, findingOffset)
	if err != nil {
		return err
	}

	return printResult(map[string]any{
		"findings": items,
		"total":    total,
	})
}

func printResult(v any) error {
	if outputFormat == "json" {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(v)
	}
	// text format
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(data))
	return nil
}

// print-full-project-settings dumps the merged settings (defaults + global + shared + project)
var printFullSettingsCmd = &cobra.Command{
	Use:   "print-full-project-settings",
	Short: "Print the full merged project settings (Pro v2)",
	RunE:  runPrintFullSettings,
}

func init() {
	rootCmd.AddCommand(printFullSettingsCmd)
}

func runPrintFullSettings(cmd *cobra.Command, args []string) error {
	loader := settings.NewSettingsLoader(projectName)
	s, err := loader.LoadSettings()
	if err != nil {
		return err
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(s.Data)
}

// Repeater command (Pro v2 repeater feature, used by agent skills)
var repeaterCmd = &cobra.Command{
	Use:   "repeater <req_file>",
	Short: "Send a raw HTTP request from a file and save timestamped req/res copies",
	Args:  cobra.ExactArgs(1),
	RunE:  runRepeater,
}

func init() {
	rootCmd.AddCommand(repeaterCmd)
}

func runRepeater(cmd *cobra.Command, args []string) error {
	reqPath := args[0]
	raw, err := os.ReadFile(reqPath)
	if err != nil {
		return fmt.Errorf("failed to read request file: %w", err)
	}

	// Split head/body on the first blank line
	head := raw
	var body []byte
	if idx := strings.Index(string(raw), "\r\n\r\n"); idx >= 0 {
		head = raw[:idx]
		body = raw[idx+4:]
	} else if idx := strings.Index(string(raw), "\n\n"); idx >= 0 {
		head = raw[:idx]
		body = raw[idx+2:]
	}

	lines := strings.Split(string(head), "\n")
	if len(lines) == 0 {
		return fmt.Errorf("empty request file")
	}
	requestLine := strings.TrimRight(lines[0], "\r")
	parts := strings.Split(requestLine, " ")
	if len(parts) < 2 {
		return fmt.Errorf("malformed request line: %q", requestLine)
	}
	method := parts[0]
	target := parts[1]

	var host, path, scheme string
	path = target
	// absolute-form request target
	if strings.HasPrefix(target, "http://") || strings.HasPrefix(target, "https://") {
		u, err := url.Parse(target)
		if err != nil {
			return fmt.Errorf("failed to parse absolute request target: %w", err)
		}
		scheme = u.Scheme
		host = u.Host
		path = u.RequestURI()
	}

	// collect headers
	var headerStrings []string
	for _, line := range lines[1:] {
		line = strings.TrimRight(line, "\r")
		if line == "" {
			continue
		}
		hname, _, _ := strings.Cut(line, ":")
		if strings.EqualFold(strings.TrimSpace(hname), "host") && host == "" {
			host = strings.TrimSpace(strings.TrimPrefix(line, hname))
		}
		if strings.EqualFold(strings.TrimSpace(hname), "content-length") {
			continue // recomputed below
		}
		headerStrings = append(headerStrings, line)
	}
	if host == "" {
		return fmt.Errorf("no Host header or absolute URL in request")
	}

	// set Content-Length from actual body (per repeater skill: never recompute manually)
	if len(body) > 0 || method == "POST" || method == "PUT" || method == "PATCH" {
		headerStrings = append(headerStrings, fmt.Sprintf("Content-Length: %d", len(body)))
	}

	// connect: https if scheme says so or port is 443
	addr := host
	tlsConn := scheme == "https" || strings.HasSuffix(host, ":443")
	if !strings.Contains(host, ":") {
		if tlsConn {
			addr = host + ":443"
		} else {
			addr = host + ":80"
		}
	}

	var conn net.Conn
	if tlsConn {
		conn, err = tls.Dial("tcp", addr, &tls.Config{InsecureSkipVerify: true})
	} else {
		conn, err = net.DialTimeout("tcp", addr, 10*time.Second)
	}
	if err != nil {
		return fmt.Errorf("failed to connect to %s: %w", addr, err)
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(30 * time.Second))

	// build raw request
	var reqBuf bytes.Buffer
	reqBuf.WriteString(fmt.Sprintf("%s %s HTTP/1.1\r\n", method, path))
	for _, h := range headerStrings {
		reqBuf.WriteString(h)
		reqBuf.WriteString("\r\n")
	}
	reqBuf.WriteString("\r\n")
	reqBuf.Write(body)

	if _, err := conn.Write(reqBuf.Bytes()); err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}

	// read response until EOF/timeout
	respBytes, err := io.ReadAll(conn)
	if err != nil && len(respBytes) == 0 {
		return fmt.Errorf("failed to read response: %w", err)
	}

	// parse status code for filenames
	status := "000"
	if len(respBytes) > 0 {
		firstLine := string(respBytes)
		if idx := strings.Index(firstLine, "\r\n"); idx > 0 {
			firstLine = firstLine[:idx]
		}
		sp := strings.SplitN(firstLine, " ", 3)
		if len(sp) >= 2 {
			status = sp[1]
		}
	}

	// save timestamped copies next to the input file
	base := strings.TrimSuffix(reqPath, filepath.Ext(reqPath))
	ts := time.Now().Format("20060102150405")
	sentReq := reqBuf.Bytes()
	if err := os.WriteFile(fmt.Sprintf("%s_%s_%s.req", base, ts, status), sentReq, 0644); err != nil {
		return fmt.Errorf("failed to save .req copy: %w", err)
	}
	if err := os.WriteFile(fmt.Sprintf("%s_%s_%s.res", base, ts, status), respBytes, 0644); err != nil {
		return fmt.Errorf("failed to save .res file: %w", err)
	}

	// stdout: raw HTTP response (per repeater skill contract)
	os.Stdout.Write(respBytes)
	if len(respBytes) > 0 && respBytes[len(respBytes)-1] != '\n' {
		os.Stdout.WriteString("\n")
	}
	return nil
}

// Monitor commands (Pro v2 monitoring mode)
var monitorCmd = &cobra.Command{
	Use:   "monitor",
	Short: "Manage scheduled monitors (Pro v2)",
}

var monitorCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a scheduled monitor",
	RunE:  runMonitorCreate,
}

var monitorListCmd = &cobra.Command{
	Use:   "list",
	Short: "List monitors",
	RunE:  runMonitorList,
}

var monitorTestCmd = &cobra.Command{
	Use:   "send-test-notifications",
	Short: "Send test notifications for every enabled kind (monitoring_notifier)",
	RunE:  runMonitorSendTest,
}

var (
	monitorName    string
	monitorType    string
	monitorURLs    string
	monitorScript  string
	monitorCron    string
	monitorDisable bool
)

func init() {
	monitorCreateCmd.Flags().StringVar(&monitorName, "name", "", "monitor name (required)")
	monitorCreateCmd.Flags().StringVar(&monitorType, "type", "url", "monitor type: url | script")
	monitorCreateCmd.Flags().StringVar(&monitorURLs, "urls", "", "comma-separated URL patterns (* wildcards allowed, for type=url)")
	monitorCreateCmd.Flags().StringVar(&monitorScript, "script", "", "shell script to run (for type=script; receives {proxy_host,proxy_port} on stdin)")
	monitorCreateCmd.Flags().StringVar(&monitorCron, "cron", "* * * * *", "5-field cron schedule")
	monitorCreateCmd.Flags().BoolVar(&monitorDisable, "disabled", false, "create the monitor disabled")

	monitorCmd.AddCommand(monitorCreateCmd)
	monitorCmd.AddCommand(monitorListCmd)
	monitorCmd.AddCommand(monitorTestCmd)
	rootCmd.AddCommand(monitorCmd)
}

func runMonitorCreate(cmd *cobra.Command, args []string) error {
	if monitorName == "" {
		return fmt.Errorf("--name is required")
	}
	var urlsJSON string
	if monitorURLs != "" {
		parts := strings.Split(monitorURLs, ",")
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		data, err := json.Marshal(parts)
		if err != nil {
			return err
		}
		urlsJSON = string(data)
	}

	db, err := openProjectDB()
	if err != nil {
		return err
	}
	defer db.Close()

	if err := monitoring.InitializeTable(db); err != nil {
		return fmt.Errorf("failed to initialize monitors table: %w", err)
	}

	id, err := monitoring.CreateMonitor(db, monitoring.Monitor{
		Name: monitorName, Type: monitorType, URLs: urlsJSON,
		Script: monitorScript, Cron: monitorCron, Enabled: !monitorDisable,
	})
	if err != nil {
		return err
	}
	return printResult(map[string]any{"success": true, "id": id})
}

func runMonitorList(cmd *cobra.Command, args []string) error {
	db, err := openProjectDB()
	if err != nil {
		return err
	}
	defer db.Close()

	if err := monitoring.InitializeTable(db); err != nil {
		return fmt.Errorf("failed to initialize monitors table: %w", err)
	}

	monitors, err := monitoring.ListMonitors(db)
	if err != nil {
		return err
	}
	return printResult(map[string]any{"monitors": monitors, "total": len(monitors)})
}

func runMonitorSendTest(cmd *cobra.Command, args []string) error {
	loader := settings.NewSettingsLoader(projectName)
	s, err := loader.LoadSettings()
	if err != nil {
		return err
	}
	raw, ok := s.Get("monitoring_notifier")
	if !ok {
		return fmt.Errorf("monitoring_notifier not configured in settings")
	}
	data, err := json.Marshal(raw)
	if err != nil {
		return err
	}
	cfg := &monitoring.NotifierConfig{}
	if err := json.Unmarshal(data, cfg); err != nil {
		return err
	}

	notifier := &monitoring.Notifier{WebhookURL: cfg.DiscordWebhookURL, Log: slog.Default()}
	if err := notifier.SendTestNotifications(cfg); err != nil {
		return err
	}
	return printResult(map[string]any{"success": true, "message": "test notifications sent"})
}
