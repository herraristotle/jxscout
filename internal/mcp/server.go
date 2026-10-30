package mcp

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

// JSON-RPC 2.0 message structures
type JSONRPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`

	// TransportProtocolVersion carries the MCP-Protocol-Version header value
	// on the HTTP transport. Not part of the JSON body.
	TransportProtocolVersion string `json:"-"`
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

// codedError lets handlers return a specific JSON-RPC error code.
type codedError struct {
	code    int
	message string
	data    interface{}
}

func (e *codedError) Error() string { return e.message }

func newCodedError(code int, message string, data interface{}) error {
	return &codedError{code: code, message: message, data: data}
}

// rpcCode maps an error to the JSON-RPC code to answer with.
func rpcCode(err error) (int, interface{}) {
	var ce *codedError
	if errors.As(err, &ce) {
		return ce.code, ce.data
	}
	return -32603, nil
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

// supportedProtocolVersions is the single MCP revision this server speaks.
// 2026-07-28 is the modern, stateless era: version and identity travel with
// each request instead of a session handshake. See
// https://modelcontextprotocol.io/specification/versioning
var supportedProtocolVersions = []string{"2026-07-28"}

const (
	latestProtocolVersion = "2026-07-28"

	// codeUnsupportedProtocolVersion is MCP's -32022 (UnsupportedProtocolVersion).
	codeUnsupportedProtocolVersion = -32022

	metaProtocolVersion = "io.modelcontextprotocol/protocolVersion"
	metaServerInfo      = "io.modelcontextprotocol/serverInfo"
)

func isSupportedProtocolVersion(v string) bool {
	return v == latestProtocolVersion
}

// requestProtocolVersion resolves the protocol version a request declares.
// The HTTP header wins when present; otherwise _meta is read.
func requestProtocolVersion(req *JSONRPCRequest) string {
	if req.TransportProtocolVersion != "" {
		return req.TransportProtocolVersion
	}
	if len(req.Params) == 0 {
		return ""
	}
	var p struct {
		Meta map[string]interface{} `json:"_meta"`
	}
	if err := json.Unmarshal(req.Params, &p); err != nil {
		return ""
	}
	if v, ok := p.Meta[metaProtocolVersion].(string); ok {
		return v
	}
	return ""
}

var serverInfo = map[string]string{
	"name":    "jxscout-mcp",
	"version": "1.0.0-oss",
}

var serverCapabilities = map[string]interface{}{
	"tools":     map[string]bool{},
	"resources": map[string]bool{},
	"prompts":   map[string]bool{},
}

// decorate adds the fields every 2026-07-28 result must carry.
func decorate(result interface{}) interface{} {
	m, ok := result.(map[string]interface{})
	if !ok {
		return result
	}
	if _, exists := m["resultType"]; !exists {
		m["resultType"] = "complete"
	}
	meta, _ := m["_meta"].(map[string]interface{})
	if meta == nil {
		meta = map[string]interface{}{}
	}
	meta[metaServerInfo] = serverInfo
	m["_meta"] = meta
	return m
}

func (s *Server) Run(ctx context.Context) error {
	// MCP frames are one JSON message per line; the default 64 KiB token limit
	// is too small for tool calls carrying asset content.
	s.scanner.Buffer(make([]byte, 0, 64*1024), 16*1024*1024)

	for s.scanner.Scan() {
		line := s.scanner.Bytes()

		var req JSONRPCRequest
		if err := json.Unmarshal(line, &req); err != nil {
			s.sendError(nil, -32700, "Parse error", nil)
			continue
		}

		// Notifications (no id) never get a response, per JSON-RPC 2.0.
		if req.ID == nil {
			continue
		}

		result, err := s.HandleRequest(ctx, &req)
		if err != nil {
			code, data := rpcCode(err)
			s.sendError(req.ID, code, err.Error(), data)
			continue
		}

		s.sendResult(req.ID, result)
	}

	return s.scanner.Err()
}

func (s *Server) HandleRequest(ctx context.Context, req *JSONRPCRequest) (interface{}, error) {
	if v := requestProtocolVersion(req); v != "" && !isSupportedProtocolVersion(v) {
		return nil, newCodedError(codeUnsupportedProtocolVersion,
			"unsupported protocol version: "+v,
			map[string]interface{}{"supported": supportedProtocolVersions})
	}

	var result interface{}
	var err error

	switch req.Method {
	case "server/discover":
		return decorate(s.handleDiscover()), nil
	case "ping":
		result = struct{}{}
	case "tools/list":
		result, err = s.handleToolsList(ctx, req.Params)
	case "tools/call":
		result, err = s.handleToolsCall(ctx, req.Params)
	case "resources/list":
		result, err = s.handleResourcesList(ctx)
	case "resources/read":
		result, err = s.handleResourcesRead(ctx, req.Params)
	case "prompts/list":
		result, err = s.handlePromptsList()
	case "prompts/get":
		result, err = s.handlePromptsGet(req.Params)
	default:
		return nil, newCodedError(-32601, "method not found: "+req.Method, nil)
	}

	if err != nil {
		return nil, err
	}
	return decorate(result), nil
}

// handleDiscover implements the mandatory server/discover RPC (2026-07-28),
// which advertises versions, capabilities and identity in one call.
func (s *Server) handleDiscover() map[string]interface{} {
	return map[string]interface{}{
		"supportedVersions": supportedProtocolVersions,
		"capabilities":      serverCapabilities,
		"cacheScope":        "public",
		"ttlMs":             0,
	}
}

func (s *Server) handlePromptsList() (interface{}, error) {
	return map[string]interface{}{
		"prompts": []map[string]interface{}{
			{
				"name":        "triage-asset",
				"description": "Review the AST descriptors of a saved asset and report interesting sinks",
				"arguments": []map[string]interface{}{
					{"name": "project", "description": "Project name", "required": true},
					{"name": "url", "description": "Asset URL", "required": true},
				},
			},
		},
	}, nil
}

func (s *Server) handlePromptsGet(params json.RawMessage) (interface{}, error) {
	var p struct {
		Name      string            `json:"name"`
		Arguments map[string]string `json:"arguments"`
	}
	if err := json.Unmarshal(params, &p); err != nil {
		return nil, fmt.Errorf("invalid prompts/get params: %w", err)
	}
	if p.Name != "triage-asset" {
		return nil, fmt.Errorf("unknown prompt: %s", p.Name)
	}

	project, ok := p.Arguments["project"]
	if !ok || project == "" {
		return nil, fmt.Errorf("project argument required")
	}
	url := p.Arguments["url"]
	if url == "" {
		return nil, fmt.Errorf("url argument required")
	}

	text := fmt.Sprintf(`Review asset %s in project %s.

1. Call jxscout_get_descriptors with project=%q url=%q.
2. Call jxscout_get_asset for the same asset to see its saved path and headers.
3. Group descriptors by analyzer. Skip matches tagged file-category-vendor
   unless nothing else qualifies — vendor tags mean bundled third-party code
   (jQuery, Angular, webpack runtime), not first-party logic.
4. Secret matches carry extra.confidence (high|medium|low|info) and
   extra.entropy. Report high-confidence secrets first; mention low/info
   ones only if nothing stronger exists. postmessage-origin-risk tags mark
   files that post/listen for messages with no event.origin check anywhere.
5. For each group, say whether the match is reachable from attacker-controlled
   input and what it would take to exploit.
6. Rank the groups by severity and name the single best candidate to
   investigate first. Do not invent data that is not in the tool output.`, url, project, project, url)

	return map[string]interface{}{
		"description": fmt.Sprintf("Triage asset %s", url),
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": map[string]string{
					"type": "text",
					"text": text,
				},
			},
		},
	}, nil
}

// assetResourceURI is the canonical resource id for a saved asset:
// jxscout://<project>/<path relative to the project assets dir>.
const assetResourceURI = "jxscout://"

func (s *Server) handleResourcesList(ctx context.Context) (interface{}, error) {
	projects, err := listProjectNames()
	if err != nil {
		return nil, err
	}

	resources := []map[string]interface{}{}
	for _, project := range projects {
		resources = append(resources, map[string]interface{}{
			"uri":         assetResourceURI + project + "/",
			"name":        project,
			"description": fmt.Sprintf("Assets saved for project %s", project),
			"mimeType":    "application/json",
		})
	}

	return map[string]interface{}{"resources": resources}, nil
}

func (s *Server) handleResourcesRead(ctx context.Context, params json.RawMessage) (interface{}, error) {
	var p struct {
		URI string `json:"uri"`
	}
	if err := json.Unmarshal(params, &p); err != nil {
		return nil, fmt.Errorf("invalid resources/read params: %w", err)
	}

	project, rel, err := parseAssetResourceURI(p.URI)
	if err != nil {
		return nil, err
	}

	assetsDir := filepath.Join(common.GetPrivateDirectory(project), "assets")
	fullPath := filepath.Join(assetsDir, rel)

	// Resolve symlinks and confirm the result stays inside the assets dir.
	resolved, err := filepath.EvalSymlinks(fullPath)
	if err != nil {
		return nil, fmt.Errorf("resource not found: %w", err)
	}
	resolvedRoot, err := filepath.EvalSymlinks(assetsDir)
	if err != nil {
		return nil, fmt.Errorf("project has no assets: %w", err)
	}
	if !strings.HasPrefix(resolved, resolvedRoot+string(os.PathSeparator)) {
		return nil, fmt.Errorf("resource escapes project assets: %s", p.URI)
	}

	content, err := os.ReadFile(resolved)
	if err != nil {
		return nil, fmt.Errorf("failed to read resource: %w", err)
	}

	return map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"uri":      p.URI,
				"mimeType": "application/javascript",
				"text":     string(content),
			},
		},
	}, nil
}

func parseAssetResourceURI(uri string) (project, rel string, err error) {
	if !strings.HasPrefix(uri, assetResourceURI) {
		return "", "", fmt.Errorf("unsupported resource uri: %s", uri)
	}
	rest := strings.TrimPrefix(uri, assetResourceURI)
	project, rel, ok := strings.Cut(rest, "/")
	if !ok || project == "" || rel == "" {
		return "", "", fmt.Errorf("resource uri must be %s<project>/<asset path>", assetResourceURI)
	}
	if _, err := projectDir(project); err != nil {
		return "", "", err
	}
	return project, rel, nil
}

// projectDir validates a project name and returns its private directory.
// Project names come from MCP clients, so reject anything that could escape
// the projects root.
func projectDir(project string) (string, error) {
	if project == "" || project == "." || project == ".." ||
		strings.ContainsAny(project, `/\`) {
		return "", fmt.Errorf("invalid project name: %q", project)
	}
	return common.GetPrivateDirectory(project), nil
}

func listProjectNames() ([]string, error) {
	entries, err := os.ReadDir(common.GetPrivateDirectoryRoot())
	if err != nil {
		return nil, fmt.Errorf("failed to read projects directory: %w", err)
	}

	projects := []string{}
	for _, entry := range entries {
		if entry.IsDir() && entry.Name() != "extracted" {
			projects = append(projects, entry.Name())
		}
	}
	return projects, nil
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
			{
				"name":        "jxscout_list_secrets",
				"description": "List secret findings for a project, sorted by confidence tier (high first). Start with min_confidence=high and widen only if needed.",
				"inputSchema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"project": map[string]string{
							"type":        "string",
							"description": "Project name",
						},
						"min_confidence": map[string]interface{}{
							"type":        "string",
							"description": "Minimum confidence tier (high|medium|low|info). Empty = all.",
							"enum":        []string{"high", "medium", "low", "info"},
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
	case "jxscout_list_secrets":
		return s.listSecrets(ctx, call.Arguments)
	default:
		return nil, fmt.Errorf("unknown tool: %s", call.Name)
	}
}

func (s *Server) listProjects(ctx context.Context) (interface{}, error) {
	projects, err := listProjectNames()
	if err != nil {
		return nil, err
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

	projectPath, err := projectDir(project)
	if err != nil {
		return nil, err
	}
	dbPath := filepath.Join(projectPath, "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var assets []struct {
		ID          int64  `db:"id"`
		URL         string `db:"url"`
		ContentType string `db:"content_type"`
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

	projectPath, err := projectDir(project)
	if err != nil {
		return nil, err
	}
	dbPath := filepath.Join(projectPath, "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var asset struct {
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

	projectPath, err := projectDir(project)
	if err != nil {
		return nil, err
	}
	dbPath := filepath.Join(projectPath, "db", "db.sql")
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

	projectPath, err := projectDir(project)
	if err != nil {
		return nil, err
	}
	dbPath := filepath.Join(projectPath, "db", "db.sql")
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var wordlist []string
	switch wlType {
	case "paths":
		wordlist, err = extractPathsFromDB(ctx, db, project)
	case "secrets":
		wordlist, err = extractAnalyzerValues(ctx, db, project, "secrets")
	case "params":
		wordlist, err = extractAnalyzerValues(ctx, db, project, "url-search-params")
	case "packages":
		wordlist, err = extractAnalyzerValues(ctx, db, project, "dependency-confusion")
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

	return sortedKeys(pathSet), nil
}

// extractAnalyzerValues returns the sorted unique `value` fields emitted by
// the named AST analyzer across a project.
func extractAnalyzerValues(ctx context.Context, db *sqlx.DB, project, analyzerName string) ([]string, error) {
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

	values := make(map[string]bool)
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
			if typ, ok := result["analyzerName"].(string); ok && typ == analyzerName {
				if value, ok := result["value"].(string); ok {
					values[value] = true
				}
			}
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sortedKeys(values), nil
}

func sortedKeys(set map[string]bool) []string {
	result := make([]string, 0, len(set))
	for k := range set {
		result = append(result, k)
	}
	sort.Strings(result)
	return result
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
