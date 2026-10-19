package optimizer

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/dbeventbus"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

//go:embed optimizer.js
var optimizerBinary []byte

type optimizerModule struct {
	sdk                   *jxscouttypes.ModuleSDK
	concurrency           int
	optimizerBinaryPath   string
}

func NewOptimizerModule(concurrency int) *optimizerModule {
	return &optimizerModule{
		concurrency: concurrency,
	}
}

func (m *optimizerModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	saveDir := filepath.Join(common.GetPrivateDirectoryRoot(), "extracted")
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		return errutil.Wrap(err, "failed to create binaries directory")
	}

	binaryPath := filepath.Join(saveDir, "optimizer.js")
	if err := os.WriteFile(binaryPath, optimizerBinary, 0755); err != nil {
		return errutil.Wrap(err, "failed to write optimizer file")
	}
	m.optimizerBinaryPath = binaryPath

	go func() {
		if err := m.subscribeBeautifiedAssets(); err != nil {
			m.sdk.Logger.Error("failed to subscribe to beautified assets", "err", err)
		}
	}()

	return nil
}

func (m *optimizerModule) subscribeBeautifiedAssets() error {
	return m.sdk.DBEventBus.Subscribe(m.sdk.Ctx, "beautifier.asset.saved", "optimizer", func(ctx context.Context, payload []byte) error {
		var event struct {
			AssetID int64 `json:"asset_id"`
		}
		if err := json.Unmarshal(payload, &event); err != nil {
			return errutil.Wrap(err, "failed to unmarshal payload")
		}

		asset, err := m.sdk.AssetService.GetAssetByID(ctx, event.AssetID)
		if err != nil {
			return dbeventbus.NewRetriableError(errutil.Wrap(err, "failed to get asset"))
		}

		if asset.IsInlineJS || asset.ContentType != common.ContentTypeJS {
			return nil
		}

		optimizedAsset, err := m.optimizeAsset(ctx, asset)
		if err != nil {
			return errutil.Wrapf(err, "failed to optimize asset: %s", asset.Path)
		}

		if optimizedAsset != nil {
			m.sdk.AssetService.AsyncSaveAsset(ctx, optimizedAsset)
		}

		return nil
	}, dbeventbus.Options{
		Concurrency:       m.concurrency,
		MaxRetries:        3,
		Backoff:           common.ExponentialBackoff,
		PollInterval:      1 * time.Second,
		HeartbeatInterval: 10 * time.Second,
	})
}

func (m *optimizerModule) optimizeAsset(ctx context.Context, asset jxscouttypes.Asset) (*jxscouttypes.Asset, error) {
	absPath, err := filepath.Abs(asset.Path)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to get absolute path")
	}

	cmd := exec.CommandContext(ctx, "bun", "run", m.optimizerBinaryPath, absPath)
	m.sdk.Logger.Debug("executing optimizer", "asset_id", asset.ID, "path", absPath)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, errutil.Wrap(err, "error creating stdout pipe")
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, errutil.Wrap(err, "error creating stderr pipe")
	}

	if err := cmd.Start(); err != nil {
		return nil, errutil.Wrap(err, "error starting optimizer")
	}

	outputBytes, err := io.ReadAll(stdout)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to read stdout")
	}

	stderrBytes, err := io.ReadAll(stderr)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to read stderr")
	}

	if err := cmd.Wait(); err != nil {
		return nil, errutil.Wrap(err, "optimizer process failed")
	}

	if len(stderrBytes) > 0 {
		return nil, fmt.Errorf("optimizer error: %s", strings.TrimSpace(string(stderrBytes)))
	}

	var result struct {
		OptimizedContent string `json:"optimized_content"`
		Changes          int    `json:"changes"`
	}
	if err := json.Unmarshal(outputBytes, &result); err != nil {
		return nil, errutil.Wrapf(err, "failed to parse optimizer output: %s", string(outputBytes))
	}

	if result.OptimizedContent == "" || result.Changes == 0 {
		return nil, nil // no changes
	}

	optimizedAsset := &jxscouttypes.Asset{
		URL:            asset.URL,
		Content:        &result.OptimizedContent,
		ContentType:    common.ContentTypeJS,
		Project:        asset.Project,
		RequestHeaders: asset.RequestHeaders,
		IsInlineJS:     false,
		IsBeautified:   false,
		IsOptimized:    true,
		OptimizedFrom:  &asset.ID,
		Parent:         asset.Parent,
	}

	return optimizedAsset, nil
}