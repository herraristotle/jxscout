package screenshot

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"os"
	"path/filepath"
	"time"

	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

type ScreenshotModule struct {
	sdk         *jxscouttypes.ModuleSDK
	concurrency int
	timeout     time.Duration
	viewport    string
	enabled     bool
	logger      *slog.Logger
	capturer    *Capturer
}

func NewScreenshotModule(concurrency int, timeout time.Duration, viewport string, enabled bool) *ScreenshotModule {
	return &ScreenshotModule{
		concurrency: concurrency,
		timeout:     timeout,
		viewport:    viewport,
		enabled:     enabled,
	}
}

func (m *ScreenshotModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.logger = sdk.Logger.With("module", "screenshot")

	if !m.enabled {
		m.logger.Info("screenshot module disabled")
		return nil
	}

	capturer, err := NewCapturer(m.timeout, m.viewport, m.logger)
	if err != nil {
		return errutil.Wrap(err, "failed to initialize screenshot capturer")
	}
	m.capturer = capturer

	// Subscribe to asset saved events, filter HTML in handler
	go m.startEventLoop()

	m.logger.Info("screenshot module initialized",
		"concurrency", m.concurrency,
		"timeout", m.timeout,
		"viewport", m.viewport,
	)

	return nil
}

func (m *ScreenshotModule) startEventLoop() {
	messages, err := m.sdk.InMemoryEventBus.Subscribe(assetservice.TopicAssetSaved)
	if err != nil {
		m.logger.Error("failed to subscribe to asset saved topic", "error", err)
		return
	}

	semaphore := make(chan struct{}, m.concurrency)

	for msg := range messages {
		event, ok := msg.Data.(assetservice.EventAssetSaved)
		if !ok {
			continue
		}

		semaphore <- struct{}{}
		go func(assetID int64) {
			defer func() { <-semaphore }()

			// Get asset details
			asset, err := m.sdk.AssetService.GetAssetByID(m.sdk.Ctx, assetID)
			if err != nil {
				m.logger.Error("failed to get asset", "asset_id", assetID, "error", err)
				return
			}

			// Only capture HTML assets
			if asset.ContentType != "text/html" {
				return
			}

			_ = m.handleHTMLAsset(m.sdk.Ctx, asset)
		}(event.AssetID)
	}
}

func (m *ScreenshotModule) handleHTMLAsset(ctx context.Context, asset jxscouttypes.Asset) error {
	if !m.enabled {
		return nil
	}

	// Check if screenshot already exists
	var existingPath *string
	err := m.sdk.Database.Get(&existingPath,
		"SELECT screenshot_path FROM assets WHERE id = ?", asset.ID)
	if err == nil && existingPath != nil && *existingPath != "" {
		return nil
	}

	m.logger.Debug("capturing screenshot", "url", asset.URL)

	screenshotPath, err := m.captureScreenshot(ctx, asset)
	if err != nil {
		m.logger.Error("failed to capture screenshot", "url", asset.URL, "error", err)
		return nil // Don't fail the pipeline
	}

	// Update asset with screenshot path
	_, err = m.sdk.Database.Exec(
		"UPDATE assets SET screenshot_path = ? WHERE id = ?",
		screenshotPath, asset.ID,
	)
	if err != nil {
		m.logger.Error("failed to update screenshot path", "asset_id", asset.ID, "error", err)
	}

	m.logger.Info("screenshot captured", "url", asset.URL, "path", screenshotPath)

	return nil
}

func (m *ScreenshotModule) captureScreenshot(ctx context.Context, asset jxscouttypes.Asset) (string, error) {
	// Create screenshots directory
	screenshotsDir := filepath.Join(common.GetWorkingDirectory(asset.Project), "screenshots")
	if err := os.MkdirAll(screenshotsDir, 0755); err != nil {
		return "", errutil.Wrap(err, "failed to create screenshots directory")
	}

	// Generate filename from URL hash
	hash := sha256.Sum256([]byte(asset.URL))
	filename := hex.EncodeToString(hash[:8]) + ".png"
	outputPath := filepath.Join(screenshotsDir, filename)

	// Check if screenshot already exists
	if _, err := os.Stat(outputPath); err == nil {
		return filename, nil
	}

	// Capture screenshot
	if err := m.capturer.Capture(ctx, asset.URL, outputPath); err != nil {
		return "", err
	}

	return filename, nil
}

func (m *ScreenshotModule) Shutdown() error {
	if m.capturer != nil {
		return m.capturer.Close()
	}
	return nil
}
