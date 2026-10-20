package monitoring

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Notifier sends monitoring notifications (Pro v2: Discord webhooks).
type Notifier struct {
	WebhookURL string
	Log        Logger
}

type Logger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}

// NotifierConfig mirrors the project settings monitoring_notifier block.
type NotifierConfig struct {
	DiscordWebhookURL    string `json:"discord_webhook_url"`
	NotifyJSFileUpdates  *bool  `json:"notify_js_file_updates"`
	NotifyNewJSFiles     *bool  `json:"notify_new_js_files"`
	NotifyNewJSMatches   *bool  `json:"notify_new_js_matches"`
	NotifyRequestFailures *bool `json:"notify_request_failures"`
	NotifyHTMLFileUpdates *bool `json:"notify_html_file_updates"`
	NotifyNewHTMLMatches *bool  `json:"notify_new_html_matches"`
}

func (c *NotifierConfig) enabled(kind string) bool {
	// defaults per Pro v2 docs
	def := map[string]bool{
		"js_file_updates":   true,
		"new_js_files":      true,
		"new_js_matches":    true,
		"request_failures":  true,
		"html_file_updates": false,
		"new_html_matches":  false,
	}[kind]

	vals := map[string]**bool{
		"js_file_updates":   &c.NotifyJSFileUpdates,
		"new_js_files":      &c.NotifyNewJSFiles,
		"new_js_matches":    &c.NotifyNewJSMatches,
		"request_failures":  &c.NotifyRequestFailures,
		"html_file_updates": &c.NotifyHTMLFileUpdates,
		"new_html_matches":  &c.NotifyNewHTMLMatches,
	}
	if p := vals[kind]; p != nil && *p != nil {
		return **p
	}
	return def
}

// Notify sends a Discord webhook message if the given kind is enabled.
func (n *Notifier) Notify(cfg *NotifierConfig, kind, message string) {
	if n.WebhookURL == "" || cfg == nil {
		return
	}
	if !cfg.enabled(kind) {
		return
	}

	payload := map[string]string{"content": fmt.Sprintf("**jxscout monitoring**\n%s", message)}
	body, err := json.Marshal(payload)
	if err != nil {
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(n.WebhookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		n.Log.Error("failed to send monitoring notification", "error", err)
		return
	}
	resp.Body.Close()
	if resp.StatusCode >= 300 {
		n.Log.Warn("monitoring notification rejected", "status", resp.StatusCode)
	}
}

// SendTestNotifications sends mock notifications for every enabled kind.
func (n *Notifier) SendTestNotifications(cfg *NotifierConfig) error {
	if n.WebhookURL == "" {
		return fmt.Errorf("no discord_webhook_url configured in monitoring_notifier")
	}
	kinds := []string{"js_file_updates", "new_js_files", "new_js_matches", "request_failures", "html_file_updates", "new_html_matches"}
	for _, k := range kinds {
		n.Notify(cfg, k, fmt.Sprintf("test notification (%s)", k))
	}
	return nil
}
