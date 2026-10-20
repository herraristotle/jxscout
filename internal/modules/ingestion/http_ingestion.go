package ingestion

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/settings"
)

// Pro v2 http_request_ingestion: saves raw HTTP traffic as plain files under
// http_requests/{host}/{path}/{METHOD}/{timestamp}_{status}.req|.res so AI
// agents can consume them.

type httpScopeRequest struct {
	Host   []string `json:"host"`
	Path   []string `json:"path"`
	Method []string `json:"method"`
}

type httpScopeEntry struct {
	MaxSavedRequestsPerUniqueEndpoint int              `json:"max_saved_requests_per_unique_endpoint"`
	RequestScope                     httpScopeRequest `json:"request_scope"`
}

type httpIngestionConfig struct {
	Enabled  bool             `json:"enabled"`
	Scope    struct {
		InScope     []httpScopeEntry `json:"in_scope"`
		OutOfScope  []httpScopeEntry `json:"out_of_scope"`
	} `json:"scope"`
}

func (m *ingestionModule) loadHTTPIngestionConfig() *httpIngestionConfig {
	loader := settings.NewSettingsLoader(m.sdk.Options.ProjectName)
	s, err := loader.LoadSettings()
	if err != nil {
		return nil
	}
	raw, ok := s.Get("http_request_ingestion")
	if !ok {
		return nil
	}
	data, err := json.Marshal(raw)
	if err != nil {
		return nil
	}
	var cfg httpIngestionConfig
	if err := json.Unmarshal(data, &cfg); err != nil || !cfg.Enabled {
		return nil
	}
	return &cfg
}

// maybeSaveHTTPRequest persists raw req/res when the request matches ingestion scope.
func (m *ingestionModule) maybeSaveHTTPRequest(req *IngestionRequest) {
	cfg := m.loadHTTPIngestionConfig()
	if cfg == nil {
		return
	}

	u, err := url.Parse(req.Request.URL)
	if err != nil || u.Host == "" {
		return
	}
	method := strings.ToUpper(req.Request.Method)
	if method == "" {
		method = "GET"
	}

	// out-of-scope wins
	for _, entry := range cfg.Scope.OutOfScope {
		if matchScopeEntry(entry.RequestScope, u.Host, u.Path, method) {
			return
		}
	}

	for _, entry := range cfg.Scope.InScope {
		if !matchScopeEntry(entry.RequestScope, u.Host, u.Path, method) {
			continue
		}

		endpointDir := filepath.Join(
			common.GetWorkingDirectory(m.sdk.Options.ProjectName),
			"http_requests",
			u.Host,
			strings.Trim(u.Path, "/"),
			method,
		)

		// per-endpoint cap
		maxSaved := entry.MaxSavedRequestsPerUniqueEndpoint
		if maxSaved <= 0 {
			maxSaved = 5
		}
		if existing, _ := filepath.Glob(filepath.Join(endpointDir, "*.req")); len(existing) >= maxSaved {
			return
		}

		if err := os.MkdirAll(endpointDir, 0755); err != nil {
			m.sdk.Logger.Error("failed to create http_requests dir", "error", err)
			return
		}

		ts := time.Now().Format("20060102150405")
		base := filepath.Join(endpointDir, fmt.Sprintf("%s_%s_%d", ts, method, req.Response.Status))

		if err := os.WriteFile(base+".req", []byte(renderRawRequest(req, u)), 0644); err != nil {
			m.sdk.Logger.Error("failed to save raw request", "error", err)
			return
		}
		if err := os.WriteFile(base+".res", []byte(renderRawResponse(req)), 0644); err != nil {
			m.sdk.Logger.Error("failed to save raw response", "error", err)
			return
		}
		m.sdk.Logger.Debug("saved raw HTTP traffic", "url", req.Request.URL, "status", req.Response.Status)
		return
	}
}

// matchScopeEntry: all present fields must match; missing fields match everything.
// Values support `*` wildcards.
func matchScopeEntry(scope httpScopeRequest, host, path, method string) bool {
	if len(scope.Host) == 0 && len(scope.Path) == 0 && len(scope.Method) == 0 {
		return false // empty scope matches nothing (avoid accidental catch-all)
	}
	if len(scope.Host) > 0 && !matchAnyGlob(scope.Host, host) {
		return false
	}
	if len(scope.Path) > 0 && !matchAnyGlob(scope.Path, path) {
		return false
	}
	if len(scope.Method) > 0 && !matchAnyGlob(scope.Method, method) {
		return false
	}
	return true
}

func matchAnyGlob(patterns []string, value string) bool {
	for _, p := range patterns {
		if globMatch(p, value) {
			return true
		}
	}
	return false
}

func globMatch(pattern, value string) bool {
	if pattern == value {
		return true
	}
	regex := "^" + regexp.QuoteMeta(pattern) + "$"
	regex = strings.ReplaceAll(regex, `\*`, ".*")
	ok, err := regexp.MatchString(regex, value)
	return err == nil && ok
}

func renderRawRequest(req *IngestionRequest, u *url.URL) string {
	var b strings.Builder
	path := u.RequestURI()
	if path == "" {
		path = "/"
	}
	fmt.Fprintf(&b, "%s %s HTTP/1.1\n", strings.ToUpper(req.Request.Method), path)
	fmt.Fprintf(&b, "Host: %s\n", u.Host)
	for k, v := range req.Request.Headers {
		if strings.EqualFold(k, "Host") || strings.EqualFold(k, "Content-Length") {
			continue
		}
		fmt.Fprintf(&b, "%s: %s\n", k, v)
	}
	b.WriteString("\n")
	b.WriteString(req.Response.Body) // note: body echoed for agent context; request bodies are not proxied back by /ingest
	return b.String()
}

func renderRawResponse(req *IngestionRequest) string {
	var b strings.Builder
	fmt.Fprintf(&b, "HTTP/1.1 %d\n", req.Response.Status)
	for k, v := range req.Response.Headers {
		fmt.Fprintf(&b, "%s: %s\n", k, v)
	}
	b.WriteString("\n")
	b.WriteString(req.Response.Body)
	return b.String()
}
