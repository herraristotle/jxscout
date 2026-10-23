package observability

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/francisconeves97/jxscout/pkg/constants"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

// Module exposes liveness and process metrics for operators and container
// health checks. /metrics speaks the Prometheus text exposition format, which
// needs no client library.
type Module struct {
	sdk       *jxscouttypes.ModuleSDK
	startedAt time.Time
}

func NewModule() *Module {
	return &Module{startedAt: time.Now()}
}

func (m *Module) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	sdk.Router.Get("/health", m.handleHealth)
	sdk.Router.Get("/metrics", m.handleMetrics)

	sdk.Logger.Info("observability module initialized")
	return nil
}

type healthResponse struct {
	Status        string  `json:"status"`
	Version       string  `json:"version"`
	UptimeSeconds float64 `json:"uptime_seconds"`
	Project       string  `json:"project"`
	Assets        *int    `json:"assets,omitempty"`
	Error         string  `json:"error,omitempty"`
}

func (m *Module) handleHealth(w http.ResponseWriter, r *http.Request) {
	resp := healthResponse{
		Status:        "ok",
		Version:       constants.Version,
		UptimeSeconds: time.Since(m.startedAt).Seconds(),
		Project:       m.sdk.Options.ProjectName,
	}
	status := http.StatusOK

	// A reachable database is the one dependency worth checking: without it the
	// proxy accepts traffic but persists nothing.
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	var count int
	if err := m.sdk.Database.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM assets WHERE project = ?", m.sdk.Options.ProjectName); err != nil {
		resp.Status = "degraded"
		resp.Error = err.Error()
		status = http.StatusServiceUnavailable
	} else {
		resp.Assets = &count
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(resp)
}

func (m *Module) handleMetrics(w http.ResponseWriter, r *http.Request) {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	w.Header().Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")

	writeMetric(w, "jxscout_uptime_seconds", "gauge",
		"Seconds since the process started.", time.Since(m.startedAt).Seconds())
	writeMetric(w, "jxscout_goroutines", "gauge",
		"Current number of goroutines.", float64(runtime.NumGoroutine()))
	writeMetric(w, "jxscout_memory_alloc_bytes", "gauge",
		"Bytes of allocated heap objects.", float64(mem.Alloc))
	writeMetric(w, "jxscout_memory_sys_bytes", "gauge",
		"Bytes obtained from the OS.", float64(mem.Sys))

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	var count int
	if err := m.sdk.Database.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM assets WHERE project = ?", m.sdk.Options.ProjectName); err == nil {
		writeMetric(w, "jxscout_assets_total", "gauge",
			"Assets stored for the active project.", float64(count))
	}
}

func writeMetric(w http.ResponseWriter, name, kind, help string, value float64) {
	fmt.Fprintf(w, "# HELP %s %s\n# TYPE %s %s\n%s %g\n", name, help, name, kind, name, value)
}
