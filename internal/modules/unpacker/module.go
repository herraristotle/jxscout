package unpacker

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

//go:embed unpacker.js
var unpackerBinary []byte

type unpackerModule struct {
	sdk                  *jxscouttypes.ModuleSDK
	concurrency          int
	unpackerBinaryPath   string
}

func NewUnpackerModule(concurrency int) *unpackerModule {
	return &unpackerModule{
		concurrency: concurrency,
	}
}

func (m *unpackerModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	saveDir := filepath.Join(common.GetPrivateDirectoryRoot(), "extracted")
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		return errutil.Wrap(err, "failed to create binaries directory")
	}

	binaryPath := filepath.Join(saveDir, "unpacker.js")
	if err := os.WriteFile(binaryPath, unpackerBinary, 0755); err != nil {
		return errutil.Wrap(err, "failed to write unpacker file")
	}
	m.unpackerBinaryPath = binaryPath

	go func() {
		if err := m.subscribeBeautifiedAssets(); err != nil {
			m.sdk.Logger.Error("failed to subscribe to beautified assets", "err", err)
		}
	}()

	return nil
}

func (m *unpackerModule) subscribeBeautifiedAssets() error {
	return m.sdk.DBEventBus.Subscribe(m.sdk.Ctx, "beautifier.asset.saved", "unpacker", func(ctx context.Context, payload []byte) error {
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

		unpackedAssets, err := m.unpackAsset(ctx, asset)
		if err != nil {
			return errutil.Wrapf(err, "failed to unpack asset: %s", asset.Path)
		}

		for _, unpacked := range unpackedAssets {
			m.sdk.AssetService.AsyncSaveAsset(ctx, unpacked)
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

func (m *unpackerModule) unpackAsset(ctx context.Context, asset jxscouttypes.Asset) ([]*jxscouttypes.Asset, error) {
	absPath, err := filepath.Abs(asset.Path)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to get absolute path")
	}

	cmd := exec.CommandContext(ctx, "bun", "run", m.unpackerBinaryPath, absPath)
	m.sdk.Logger.Debug("executing unpacker", "asset_id", asset.ID, "path", absPath)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, errutil.Wrap(err, "error creating stdout pipe")
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, errutil.Wrap(err, "error creating stderr pipe")
	}

	if err := cmd.Start(); err != nil {
		return nil, errutil.Wrap(err, "error starting unpacker")
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
		return nil, errutil.Wrap(err, "unpacker process failed")
	}

	if len(stderrBytes) > 0 {
		return nil, fmt.Errorf("unpacker error: %s", strings.TrimSpace(string(stderrBytes)))
	}

	var result struct {
		Files []struct {
			Path    string `json:"path"`
			Content string `json:"content"`
		} `json:"files"`
	}
	if err := json.Unmarshal(outputBytes, &result); err != nil {
		return nil, errutil.Wrapf(err, "failed to parse unpacker output: %s", string(outputBytes))
	}

	var unpackedAssets []*jxscouttypes.Asset
	for _, f := range result.Files {
		if f.Content == "" {
			continue
		}
		unpackedAssets = append(unpackedAssets, &jxscouttypes.Asset{
			URL:            f.Path,
			Content:        &f.Content,
			ContentType:    common.ContentTypeJS,
			Project:        asset.Project,
			RequestHeaders: asset.RequestHeaders,
			IsInlineJS:     false,
			IsUnpacked:     true,
			UnpackedFrom:   &asset.ID,
			Parent:         asset.Parent,
		})
	}

	return unpackedAssets, nil
}