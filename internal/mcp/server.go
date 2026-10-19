package mcp

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/francisconeves97/jxscout/internal/core/common"
	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

// JSON-RPC 2.0 message structures
type JSONRPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type JSONRPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type Server struct {
	scanner *bufio.Scanner
	encoder *json.Encoder
}

func NewServer() *Server {
	return &Server{
		scanner: bufio.NewScanner(os.Stdin),
		encoder: json.NewEncoder(os.Stdout),
	}
}

func (s *Server) Run(ctx context.Context) error {
	for s.scanner.Scan() {
		line := s.scanner.Bytes()

		var req JSONRPCRequest
		if err := json.Unmarshal(line, &req); err != nil {
			s.sendError(nil, -32700, "Parse error", nil)
			continue
		}

		result, err := s.handleRequest(ctx, &req)
		if err != nil {
			s.sendError(req.ID, -32603, err.Error(), nil)
			continue
		}

		s.sendResult(req.ID, result)
	}

	return s.scanner.Err()
}

func (s *Server) handleRequest(ctx context.Context, req *JSONRPCRequest) (interface{}, error) {
	switch req.Method {
	case "initialize":
		return s.handleInitialize(ctx, req.Params)
	case "tools/list":
		return s.handleToolsList(ctx, req.Params)
	case "tools/call":
		return s.handleToolsCall(ctx, req.Params)
	default:
		return nil, fmt.Errorf("method not found: %s", req.Method)
	}
}

func (s *Server) handleInitialize(ctx context.Context, params json.RawMessage) (interface{}, error) {
	return map[string]interface{}{
		"protocolVersion": "2024-11-05",
		"serverInfo": map[string]string{
			"name":    "jxscout-mcp",
			"version": "1.0.0-oss",
		},
		"capabilities": map[string]interface{}{
			"tools": map[string]bool{},
		},
	}, nil
}

func (s *Server) handleToolsList(ctx context.Context, params json.RawMessage) (interface{}, error) {
	return map[string]interface{}{
		"tools": []map[string]interface{}{
			{
				"name":        "jxscout_list_projects",
				"description": "List available JXScout projects",
				"inputSchema": map[string]interface{}{
					"type":       "object",
					"properties": map[string]interface{}{},
				},
			},
			{
				"name":        "jxscout_list_assets",
				"description": "List assets in a project",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"project": map[string]string{
							"type":        "string",
							"description": "Project name",
						},
						"limit": map[string]interface{}{
							"type":        "integer",
							"description": "Max results (default 100)",
							"default":     100,
						},
					},
					"required": []string{"project"},
				},
			},
			{
				"name":        "jxscout_get_asset",
				"description": "Get asset details by URL",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"project": map[string]string{
							"type":        "string",
							"description": "Project name",
						},
						"url": map[string]string{
							"type":        "string",
							"description": "Asset URL",
						},
					},
					"required": []string{"project", "url"},
				},
			},
			{
				"name":        "jxscout_get_descriptors",
				"description": "Get AST analysis descriptors for an asset",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"project": map[string]string{
							"type":        "string",
							"description": "Project name",
						},
						"url": map[string]string{
							"type":        "string",
							"description": "Asset URL",
						},
					},
					"required": []string{"project", "url"},
				},
			},
			{
				"name":        "jxscout_generate_wordlist",
				"description": "Generate wordlist from project (paths, secrets, params, packages)",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"project": map[string]string{
							"type":        "string",
							"description": "Project name",
						},
						"type": map[string]interface{}{
							"type":        "string",
							"description": "Wordlist type",
							"enum":        []string{"paths", "secrets", "params", "packages"},
							"default":     "paths",
						},
					},
					"required": []string{"project"},
				},
			},
		},
	}, nil
}

func (s *Server) handleToolsCall(ctx context.Context, params json.RawMessage) (interface{}, error) {
	var call struct {
		Name      string                 `json:"name"`
		Arguments map[string]interface{} `json:"arguments"`
	}

	if err := json.Unmarshal(params, &call); err != nil {
		return nil, fmt.Errorf("invalid tool call params: %w", err)
	}

	switch call.Name {
	case "jxscout_list_projects":
		return s.listProjects(ctx)
	case "jxscout_list_assets":
		return s.listAssets(ctx, call.Arguments)
	case "jxscout_get_asset":
		return s.getAsset(ctx, call.Arguments)
	case "jxscout_get_descriptors":
		return s.getDescriptors(ctx, call.Arguments)
	case "jxscout_generate_wordlist":
		return s.generateWordlist(ctx, call.Arguments)
	default:
		return nil, fmt.Errorf("unknown tool: %s", call.Name)
	}
}

func (s *Server) listProjects(ctx context.Context) (interface{}, error) {
	rootDir := common.GetPrivateDirectoryRoot()
	entries, err := os.ReadDir(rootDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read projects directory: %w", err)
	}

	projects := []string{}
	for _, entry := range entries {
		if entry.IsDir() && entry.Name() != "extracted" {
			projects = append(projects, entry.Name())
		}
	}

	return map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": fmt.Sprintf("Available projects: %v", projects),
			},
		},
	}, nil
}

func (s *Server) listAssets(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	project, ok := args["project"].(string)
	if !ok {
		return nil, fmt.Errorf("project parameter required")
	}

	limit := 100
	if l, ok := args["limit"].(float64); ok {
		limit = int(l)
	}

	dbPath := filepath.Join(common.GetPrivateDirectory(project), "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var assets []struct {
		ID           int64  `db:"id"`
		URL          string `db:"url"`
		ContentType  string `db:"content_type"`
	}
	err = db.SelectContext(ctx, &assets,
		"SELECT id, url, content_type FROM assets WHERE project = ? LIMIT ?",
		project, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query assets: %w", err)
	}

	result, _ := json.Marshal(assets)
	return map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": string(result),
			},
		},
	}, nil
}

func (s *Server) getAsset(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	project, _ := args["project"].(string)
	url, _ := args["url"].(string)

	if project == "" || url == "" {
		return nil, fmt.Errorf("project and url parameters required")
	}

	dbPath := filepath.Join(common.GetPrivateDirectory(project), "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var asset struct {
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
	err = db.GetContext(ctx, &asset,
		"SELECT id, url, content_hash, content_type, fs_path, project, request_headers, created_at, updated_at, is_inline_js, is_chunk_discovered, chunk_from_asset_id, is_beautified FROM assets WHERE project = ? AND url = ?",
		project, url)
	if err != nil {
		return nil, fmt.Errorf("asset not found: %w", err)
	}

	result, _ := json.Marshal(asset)
	return map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": string(result),
			},
		},
	}, nil
}

func (s *Server) getDescriptors(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	project, _ := args["project"].(string)
	url, _ := args["url"].(string)

	if project == "" || url == "" {
		return nil, fmt.Errorf("project and url parameters required")
	}

	dbPath := filepath.Join(common.GetPrivateDirectory(project), "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var resultsJSON string
	err = db.GetContext(ctx, &resultsJSON, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ? AND a.url = ?
	`, project, url)
	if err != nil {
		return nil, fmt.Errorf("descriptors not found: %w", err)
	}

	return map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": resultsJSON,
			},
		},
	}, nil
}

func (s *Server) generateWordlist(ctx context.Context, args map[string]interface{}) (interface{}, error) {
	project, _ := args["project"].(string)
	wlType, _ := args["type"].(string)

	if project == "" {
		return nil, fmt.Errorf("project parameter required")
	}
	if wlType == "" {
		wlType = "paths"
	}

	dbPath := filepath.Join(common.GetPrivateDirectory(project), "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var wordlist []string
	switch wlType {
	case "paths":
		wordlist, err = extractPathsFromDB(ctx, db, project)
	case "packages":
		wordlist, err = extractPackagesFromDB(ctx, db, project)
	default:
		return nil, fmt.Errorf("unsupported wordlist type: %s", wlType)
	}

	if err != nil {
		return nil, err
	}

	result, _ := json.Marshal(wordlist)
	return map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": string(result),
			},
		},
	}, nil
}

func extractPathsFromDB(ctx context.Context, db *sqlx.DB, project string) ([]string, error) {
	var assets []assetservice.Asset
	err := db.SelectContext(ctx, &assets, "SELECT url FROM assets WHERE project = ?", project)
	if err != nil {
		return nil, err
	}

	pathSet := make(map[string]bool)
	for _, asset := range assets {
		parts := strings.Split(asset.URL, "/")
		for _, part := range parts {
			if part != "" {
				pathSet[part] = true
			}
		}
	}

	result := make([]string, 0, len(pathSet))
	for path := range pathSet {
		result = append(result, path)
	}
	return result, nil
}

func extractPackagesFromDB(ctx context.Context, db *sqlx.DB, project string) ([]string, error) {
	rows, err := db.QueryContext(ctx, `
		SELECT aa.results
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, project)
	if err != nil {
		return nil, err
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

	result := make([]string, 0, len(packageSet))
	for pkg := range packageSet {
		result = append(result, pkg)
	}
	return result, nil
}

func (s *Server) sendResult(id interface{}, result interface{}) {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Result:  result,
	}
	s.encoder.Encode(resp)
}

func (s *Server) sendError(id interface{}, code int, message string, data interface{}) {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Error: &RPCError{
			Code:    code,
			Message: message,
			Data:    data,
		},
	}
	s.encoder.Encode(resp)
}
