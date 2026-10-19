package cli

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/spf13/cobra"
)

var (
	projectName string
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
		ID                int64            `db:"id"`
		URL               string           `db:"url"`
		ContentHash       string           `db:"content_hash"`
		ContentType       string           `db:"content_type"`
		FileSystemPath    string           `db:"fs_path"`
		Project           string           `db:"project"`
		RequestHeaders    *string          `db:"request_headers"`
		CreatedAt         *string          `db:"created_at"`
		UpdatedAt         *string          `db:"updated_at"`
		IsInlineJS        bool             `db:"is_inline_js"`
		IsChunkDiscovered *bool            `db:"is_chunk_discovered"`
		ChunkFromAssetID  *int64           `db:"chunk_from_asset_id"`
		IsBeautified      bool             `db:"is_beautified"`
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
	recursive bool
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
