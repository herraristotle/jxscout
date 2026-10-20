package monitoring

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/settings"
	"github.com/jmoiron/sqlx"
)

// Monitor is a scheduled check for updates on tracked targets (Pro v2 monitoring).
type Monitor struct {
	ID      int64  `db:"id" json:"id"`
	Name    string `db:"name" json:"name"`
	Type    string `db:"type" json:"type"` // "url" | "script"
	URLs    string `db:"urls" json:"urls"` // JSON array (URL monitors; * wildcards allowed)
	Script  string `db:"script" json:"script,omitempty"`
	Cron    string `db:"cron" json:"cron"`
	Enabled bool   `db:"enabled" json:"enabled"`
}

func InitializeTable(db *sqlx.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS monitors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			urls TEXT,
			script TEXT,
			cron TEXT NOT NULL,
			enabled BOOLEAN DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	return err
}

func CreateMonitor(db *sqlx.DB, m Monitor) (int64, error) {
	if _, err := ParseCron(m.Cron); err != nil {
		return 0, fmt.Errorf("invalid cron: %w", err)
	}
	if m.Type == "url" && m.URLs == "" {
		return 0, fmt.Errorf("url monitors require urls")
	}
	if m.Type == "script" && m.Script == "" {
		return 0, fmt.Errorf("script monitors require a script")
	}
	res, err := db.Exec("INSERT INTO monitors (name, type, urls, script, cron, enabled) VALUES (?, ?, ?, ?, ?, ?)",
		m.Name, m.Type, m.URLs, m.Script, m.Cron, m.Enabled)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func ListMonitors(db *sqlx.DB) ([]Monitor, error) {
	var monitors []Monitor
	err := db.Select(&monitors, "SELECT id, name, type, urls, script, cron, enabled FROM monitors ORDER BY id")
	return monitors, err
}

// Runner executes monitors on schedule and notifies on updates.
type Runner struct {
	db       *sqlx.DB
	notifier *Notifier
	config   *NotifierConfig
	log      Logger
	proxyHost string
	proxyPort int

	mu       sync.Mutex
	lastHash map[int64]map[string]string // monitorID -> url -> content hash
}

func NewRunner(db *sqlx.DB, log Logger, proxyHost string, proxyPort int) *Runner {
	return &Runner{
		db:        db,
		notifier:  &Notifier{Log: log},
		log:       log,
		proxyHost: proxyHost,
		proxyPort: proxyPort,
		lastHash:  map[int64]map[string]string{},
	}
}

// ReloadConfig re-reads monitoring_notifier from project settings.
func (r *Runner) ReloadConfig(projectName string) {
	loader := settings.NewSettingsLoader(projectName)
	s, err := loader.LoadSettings()
	if err != nil {
		return
	}
	if raw, ok := s.Get("monitoring_notifier"); ok {
		if data, err := json.Marshal(raw); err == nil {
			cfg := &NotifierConfig{}
			if json.Unmarshal(data, cfg) == nil {
				r.mu.Lock()
				r.config = cfg
				r.notifier.WebhookURL = cfg.DiscordWebhookURL
				r.mu.Unlock()
			}
		}
	}
}

// Start runs the scheduling loop until ctx is done.
func (r *Runner) Start(ctx context.Context, projectName string) {
	r.ReloadConfig(projectName)

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				r.ReloadConfig(projectName)
				r.runDue(ctx, projectName)
			}
		}
	}()
}

func (r *Runner) runDue(ctx context.Context, projectName string) {
	monitors, err := ListMonitors(r.db)
	if err != nil {
		return
	}
	now := time.Now()
	for _, monitor := range monitors {
		if !monitor.Enabled {
			continue
		}
		cronExpr, err := ParseCron(monitor.Cron)
		if err != nil {
			continue
		}
		next := cronExpr.Next(now.Add(-time.Minute))
		if next.Minute() != now.Minute() || next.Hour() != now.Hour() {
			continue
		}

		r.mu.Lock()
		cfg := r.config
		r.mu.Unlock()
		if cfg == nil || cfg.DiscordWebhookURL == "" {
			r.log.Warn("monitor due but no monitoring_notifier.discord_webhook_url configured", "monitor", monitor.Name)
			continue
		}

		switch monitor.Type {
		case "url":
			r.runURLMonitor(ctx, projectName, monitor, cfg)
		case "script":
			r.runScriptMonitor(ctx, monitor, cfg)
		}
	}
}

func (r *Runner) runURLMonitor(ctx context.Context, projectName string, monitor Monitor, cfg *NotifierConfig) {
	var patterns []string
	if err := json.Unmarshal([]byte(monitor.URLs), &patterns); err != nil {
		r.log.Error("invalid monitor urls", "monitor", monitor.Name, "error", err)
		return
	}

	rows, err := r.db.QueryxContext(ctx, "SELECT url, content_hash, content_type, fs_path FROM assets WHERE project = ?", projectName)
	if err != nil {
		return
	}
	defer rows.Close()

	client := &http.Client{Timeout: 30 * time.Second}
	for rows.Next() {
		var url, hash, contentType, fsPath string
		if err := rows.Scan(&url, &hash, &contentType, &fsPath); err != nil {
			continue
		}
		if !urlMatchesAny(patterns, url) {
			continue
		}

		resp, err := client.Get(url)
		if err != nil {
			r.notifier.Notify(cfg, "request_failures", fmt.Sprintf("request failed: %s\n%s", url, err.Error()))
			continue
		}
		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			r.notifier.Notify(cfg, "request_failures", fmt.Sprintf("read failed: %s\n%s", url, err.Error()))
			continue
		}
		if resp.StatusCode >= 400 {
			r.notifier.Notify(cfg, "request_failures", fmt.Sprintf("HTTP %d: %s", resp.StatusCode, url))
			continue
		}

		newHash := common.Hash(string(body))
		r.mu.Lock()
		if r.lastHash[monitor.ID] == nil {
			r.lastHash[monitor.ID] = map[string]string{}
		}
		prev := r.lastHash[monitor.ID][url]
		if prev == "" {
			prev = hash // fall back to DB hash on first observation
		}
		r.lastHash[monitor.ID][url] = newHash
		r.mu.Unlock()

		if newHash == prev {
			continue
		}

		isHTML := strings.Contains(contentType, "HTML") || strings.HasSuffix(url, ".html")
		if isHTML {
			r.notifier.Notify(cfg, "html_file_updates", fmt.Sprintf("HTML updated: %s", url))
		} else {
			r.notifier.Notify(cfg, "js_file_updates", fmt.Sprintf("JS updated: %s", url))
		}

		// save new content and ingest into the pipeline
		if err := os.WriteFile(fsPath, body, 0644); err == nil {
			if data, err := json.Marshal(map[string]any{
				"request":  map[string]any{"method": "GET", "url": url, "headers": map[string]string{}},
				"response": map[string]any{"status": resp.StatusCode, "headers": map[string]string{"Content-Type": contentType}, "body": string(body)},
			}); err == nil {
				postBody := bytes.NewReader(data)
				ingestURL := fmt.Sprintf("http://%s:%d/ingest", r.proxyHost, r.proxyPort)
				if req, err := http.NewRequestWithContext(ctx, http.MethodPost, ingestURL, postBody); err == nil {
					req.Header.Set("Content-Type", "application/json")
					if resp2, err := client.Do(req); err == nil {
						resp2.Body.Close()
					}
				}
			}
		}
	}
}

func (r *Runner) runScriptMonitor(ctx context.Context, monitor Monitor, cfg *NotifierConfig) {
	// script monitors receive {proxy_host, proxy_port} on stdin (Pro v2 spec)
	payload, _ := json.Marshal(map[string]any{"proxy_host": r.proxyHost, "proxy_port": r.proxyPort})

	cmd := exec.CommandContext(ctx, "sh", "-c", monitor.Script)
	cmd.Stdin = strings.NewReader(string(payload))
	var stderr strings.Builder
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		r.notifier.Notify(cfg, "request_failures",
			fmt.Sprintf("script monitor %q failed: %s\n%s", monitor.Name, err.Error(), strings.TrimSpace(stderr.String())))
	}
}

// urlMatchesAny: exact match or `*` wildcard match.
func urlMatchesAny(patterns []string, url string) bool {
	for _, p := range patterns {
		if p == url {
			return true
		}
		regex := "^" + strings.ReplaceAll(regexp.QuoteMeta(p), `\*`, ".*") + "$"
		if ok, err := regexp.MatchString(regex, url); err == nil && ok {
			return true
		}
	}
	return false
}
