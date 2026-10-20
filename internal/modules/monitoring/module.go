package monitoring

import (
	"encoding/json"
	"net/http"

	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

// MonitoringModule runs scheduled monitors with Discord notifications (Pro v2 monitoring mode).
type MonitoringModule struct {
	sdk    *jxscouttypes.ModuleSDK
	runner *Runner
}

func NewMonitoringModule() *MonitoringModule {
	return &MonitoringModule{}
}

func (m *MonitoringModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	if err := InitializeTable(sdk.Database); err != nil {
		return err
	}

	sdk.Router.Route("/monitors", func(r jxscouttypes.Router) {
		r.Post("/", m.handleCreate)
		r.Get("/", m.handleList)
	})

	if !sdk.Options.Monitoring {
		return nil
	}

	runner := NewRunner(sdk.Database, sdk.Logger, sdk.Options.Hostname, sdk.Options.Port)
	runner.ReloadConfig(sdk.Options.ProjectName)
	if runner.config == nil || runner.config.DiscordWebhookURL == "" {
		sdk.Logger.Warn("monitoring enabled but monitoring_notifier.discord_webhook_url not configured")
	}
	runner.Start(sdk.Ctx, sdk.Options.ProjectName)
	m.runner = runner
	sdk.Logger.Info("monitoring mode enabled")
	return nil
}

func (m *MonitoringModule) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name    string          `json:"name"`
		Type    string          `json:"type"`
		URLs    json.RawMessage `json:"urls"`
		Script  string          `json:"script"`
		Cron    string          `json:"cron"`
		Enabled *bool           `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid request body", http.StatusBadRequest)
		return
	}
	enabled := true
	if body.Enabled != nil {
		enabled = *body.Enabled
	}
	id, err := CreateMonitor(m.sdk.Database, Monitor{
		Name: body.Name, Type: body.Type, URLs: string(body.URLs),
		Script: body.Script, Cron: body.Cron, Enabled: enabled,
	})
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}
	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusCreated, map[string]any{"id": id})
}

func (m *MonitoringModule) handleList(w http.ResponseWriter, r *http.Request) {
	monitors, err := ListMonitors(m.sdk.Database)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, monitors)
}
