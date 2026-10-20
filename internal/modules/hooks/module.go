package hooksmodule

import (
	"context"
	"encoding/json"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"

	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/dbeventbus"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	"github.com/francisconeves97/jxscout/internal/core/findings"
	"github.com/francisconeves97/jxscout/internal/hooks"
	"github.com/francisconeves97/jxscout/internal/modules/beautifier"
	"github.com/francisconeves97/jxscout/internal/modules/sourcemaps"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

type HooksModule struct {
	mu       sync.RWMutex
	executor *hooks.Executor
	sdk      *jxscouttypes.ModuleSDK
	logger   *slog.Logger
}

func NewHooksModule() *HooksModule {
	return &HooksModule{}
}

func (m *HooksModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.logger = sdk.Logger.With("module", "hooks")

	if config, err := hooks.LoadHooks(sdk.Options.ProjectName); err != nil {
		m.logger.Debug("no hooks configured", "error", err)
	} else {
		m.executor = hooks.NewExecutor(config, m.logger)
	}

	// Auto-reload: re-read settings when any tier's settings file changes
	go m.watchSettings()

	opts := dbeventbus.Options{
		Concurrency:       2,
		MaxRetries:        2,
		Backoff:           common.ExponentialBackoff,
		PollInterval:      1 * time.Second,
		HeartbeatInterval: 10 * time.Second,
	}

	// js_file_saved / js_file_updated / html_file_saved / html_file_updated
	if err := sdk.DBEventBus.Subscribe(sdk.Ctx, assetservice.TopicAssetSaved, "hooks", func(ctx context.Context, payload []byte) error {
		var event assetservice.EventAssetSaved
		if err := json.Unmarshal(payload, &event); err != nil {
			return err
		}
		asset, err := sdk.AssetService.GetAssetByID(ctx, event.AssetID)
		if err != nil {
			return dbeventbus.NewRetriableError(err)
		}

		fileType := "js"
		eventName := "js_file_saved"
		if asset.ContentType == string(common.ContentTypeHTML) {
			fileType = "html"
			eventName = "html_file_saved"
		}
		if event.Updated {
			eventName = fileType + "_file_updated"
		}

		m.execute(eventName, hooks.FileEventPayload{
			FileType:       fileType,
			URL:            asset.URL,
			FilePath:       asset.Path,
			RequestHeaders: asset.RequestHeaders,
		})
		return nil
	}, opts); err != nil {
		return errutil.Wrap(err, "failed to subscribe to asset saved")
	}

	// js_file_beautified / html_file_beautified
	if err := sdk.DBEventBus.Subscribe(sdk.Ctx, beautifier.TopicBeautifierAssetSaved, "hooks", func(ctx context.Context, payload []byte) error {
		var event beautifier.EventBeautifierAssetSaved
		if err := json.Unmarshal(payload, &event); err != nil {
			return err
		}
		asset, err := sdk.AssetService.GetAssetByID(ctx, event.AssetID)
		if err != nil {
			return dbeventbus.NewRetriableError(err)
		}

		fileType := "js"
		if asset.ContentType == string(common.ContentTypeHTML) {
			fileType = "html"
		}

		m.execute(fileType+"_file_beautified", hooks.FileEventPayload{
			FileType:       fileType,
			URL:            asset.URL,
			FilePath:       asset.Path,
			RequestHeaders: asset.RequestHeaders,
		})
		return nil
	}, opts); err != nil {
		return errutil.Wrap(err, "failed to subscribe to beautified")
	}

	// reversed_source_map_file_saved
	if err := sdk.DBEventBus.Subscribe(sdk.Ctx, sourcemaps.TopicSourcemapsReversedSourcemapSaved, "hooks", func(ctx context.Context, payload []byte) error {
		var event sourcemaps.EventSourcemapsReversedSourcemapSaved
		if err := json.Unmarshal(payload, &event); err != nil {
			return err
		}

		var reversed sourcemaps.ReversedSourcemap
		if err := sdk.Database.GetContext(ctx, &reversed, "SELECT * FROM reversed_sourcemaps WHERE id = ?", event.ReversedSourcemapID); err != nil {
			return dbeventbus.NewRetriableError(err)
		}

		m.execute("reversed_source_map_file_saved", hooks.ReversedSourceMapPayload{
			FileType: "reversed_source",
			FilePath: reversed.Path,
		})
		return nil
	}, opts); err != nil {
		return errutil.Wrap(err, "failed to subscribe to reversed sourcemap saved")
	}

	// matches_created — payload published by ast-analyzer already in v2 shape
	if err := sdk.DBEventBus.Subscribe(sdk.Ctx, "ast_analyzer.matches_created", "hooks", func(ctx context.Context, payload []byte) error {
		var event struct {
			AssetID  int64            `json:"asset_id"`
			FileType string           `json:"file_type"`
			FilePath string           `json:"file_path"`
			Matches  []hooks.MatchEntry `json:"matches"`
		}
		if err := json.Unmarshal(payload, &event); err != nil {
			return err
		}

		m.execute("matches_created", hooks.MatchesCreatedPayload{
			FileType: event.FileType,
			FilePath: event.FilePath,
			Matches:  event.Matches,
		})
		return nil
	}, opts); err != nil {
		return errutil.Wrap(err, "failed to subscribe to matches created")
	}

	// finding_created — payload published by the findings module (forwarded as-is)
	if err := sdk.DBEventBus.Subscribe(sdk.Ctx, findings.TopicFindingCreated, "hooks", func(ctx context.Context, payload []byte) error {
		m.execute("finding_created", json.RawMessage(payload))
		return nil
	}, opts); err != nil {
		return errutil.Wrap(err, "failed to subscribe to finding created")
	}

	processCount := 0
	m.mu.RLock()
	if m.executor != nil {
		for _, procs := range m.executor.Config().Events {
			processCount += len(procs)
		}
	}
	m.mu.RUnlock()
	m.logger.Info("hooks module initialized (v2) + settings auto-reload", "processes", processCount)

	return nil
}

// execute runs the hook for an event using the current (possibly reloaded) executor
func (m *HooksModule) execute(eventName string, payload any) {
	m.mu.RLock()
	e := m.executor
	m.mu.RUnlock()
	if e == nil {
		return
	}
	e.Execute(eventName, m.projectDir(), m.projectName(), payload)
}

// watchSettings polls settings files and hot-reloads the hooks config (Pro v2 auto-reload)
func (m *HooksModule) watchSettings() {
	home := os.Getenv("HOME")
	files := []string{
		filepath.Join(home, ".jxscout", "global_settings.jsonc"),
		filepath.Join(home, ".jxscout", "shared_project_settings.jsonc"),
		filepath.Join(common.GetPrivateDirectory(m.sdk.Options.ProjectName), "settings.jsonc"),
	}

	lastMod := map[string]time.Time{}
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.sdk.Ctx.Done():
			return
		case <-ticker.C:
			changed := false
			for _, f := range files {
				info, err := os.Stat(f)
				if err != nil {
					continue
				}
				if prev, ok := lastMod[f]; !ok {
					lastMod[f] = info.ModTime()
				} else if info.ModTime().After(prev) {
					lastMod[f] = info.ModTime()
					changed = true
				}
			}
			if !changed {
				continue
			}

			if config, err := hooks.LoadHooks(m.sdk.Options.ProjectName); err != nil {
				m.mu.Lock()
				m.executor = nil
				m.mu.Unlock()
				m.logger.Info("hooks disabled (config removed or invalid)", "error", err)
			} else {
				m.mu.Lock()
				m.executor = hooks.NewExecutor(config, m.logger)
				m.mu.Unlock()
				m.logger.Info("hooks configuration reloaded", "events", len(config.Events))
			}
		}
	}
}

func (m *HooksModule) projectDir() string {
	return common.GetWorkingDirectory(m.sdk.Options.ProjectName)
}

func (m *HooksModule) projectName() string {
	return m.sdk.Options.ProjectName
}
