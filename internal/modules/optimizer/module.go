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
	"runtime"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/dbeventbus"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	"github.com/francisconeves97/jxscout/internal/modules/beautifier"
	"github.com/francisconeves97/jxscout/internal/settings"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

//go:embed optimizer.js
var optimizerBinary []byte

//go:embed parser.linux-x64-gnu.node
var parserLinuxX64Gnu []byte

//go:embed parser.linux-x64-musl.node
var parserLinuxX64Musl []byte

type optimizerModule struct {
	sdk                 *jxscouttypes.ModuleSDK
	concurrency         int
	optimizerBinaryPath string
	transformers        string // comma-separated: json_parse,variable_inliner,string_concat
	iterations          int
	nativeLibraryPath   string
}

func NewOptimizerModule(concurrency int) *optimizerModule {
	return &optimizerModule{
		concurrency: concurrency,
		// Pro v2 defaults: all three transformers, single pass; settings override
		transformers: "json_parse,variable_inliner,string_concat",
		iterations:   1,
	}
}

func (m *optimizerModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	// Pro v2 beautifier.transformations settings
	if loader := settings.NewSettingsLoader(sdk.Options.ProjectName); true {
		if s, err := loader.LoadSettings(); err == nil {
			if arr, ok := s.Get("beautifier.transformations.transformers"); ok {
				if list, ok := arr.([]interface{}); ok {
					names := make([]string, 0, len(list))
					for _, t := range list {
						if str, ok := t.(string); ok && str != "" {
							names = append(names, str)
						}
					}
					if len(names) > 0 {
						m.transformers = strings.Join(names, ",")
					}
				}
			}
			if v, ok := s.GetInt("beautifier.transformations.iterations"); ok && v > 0 {
				m.iterations = v
			}
		}
	}

	if !sdk.Options.EnableOptimizer {
		sdk.Logger.Info("optimizer module disabled (enable-optimizer=false)")
		return nil
	}

	saveDir := filepath.Join(common.GetPrivateDirectoryRoot(), "extracted")
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		return errutil.Wrap(err, "failed to create binaries directory")
	}

	binaryPath := filepath.Join(saveDir, "optimizer.js")
	if err := os.WriteFile(binaryPath, optimizerBinary, 0755); err != nil {
		return errutil.Wrap(err, "failed to write optimizer file")
	}
	m.optimizerBinaryPath = binaryPath

	// write platform parser binding if we embed one for this platform
	if data, ok := m.platformParser(); ok {
		parserPath := filepath.Join(saveDir, "parser.node")
		if err := os.WriteFile(parserPath, data, 0755); err != nil {
			return errutil.Wrap(err, "failed to write optimizer parser binding")
		}
		m.nativeLibraryPath = parserPath
	}

	go func() {
		if err := m.subscribeBeautifiedAssets(); err != nil {
			m.sdk.Logger.Error("failed to subscribe to beautified assets", "err", err)
		}
	}()

	m.sdk.Logger.Info("optimizer module initialized", "transformers", m.transformers, "iterations", m.iterations)

	return nil
}

// platformParser returns the embedded oxc parser binding for this platform (if available)
func (m *optimizerModule) platformParser() ([]byte, bool) {
	if runtime.GOOS != "linux" || runtime.GOARCH != "amd64" {
		return nil, false
	}
	if libc, err := getLibcVariant(); err == nil && libc == "musl" {
		return parserLinuxX64Musl, true
	}
	return parserLinuxX64Gnu, true
}

func getLibcVariant() (string, error) {
	cmd := exec.Command("ldd", "--version")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "gnu", nil // ldd --version exits 1 on some systems while still printing
	}
	output := strings.ToLower(string(out))
	if strings.Contains(output, "musl") {
		return "musl", nil
	}
	return "gnu", nil
}

func (m *optimizerModule) subscribeBeautifiedAssets() error {
	return m.sdk.DBEventBus.Subscribe(m.sdk.Ctx, beautifier.TopicBeautifierAssetSaved, "optimizer", func(ctx context.Context, payload []byte) error {
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

	// Pro v2: bun run optimizer.js <file> <transformers_csv> <iterations>
	cmd := exec.CommandContext(ctx, "bun", "run", m.optimizerBinaryPath, absPath, m.transformers, fmt.Sprint(m.iterations))
	m.sdk.Logger.Debug("executing optimizer", "asset_id", asset.ID, "path", absPath, "transformers", m.transformers, "iterations", m.iterations)

	if m.nativeLibraryPath != "" {
		cmd.Env = append(os.Environ(), "NAPI_RS_NATIVE_LIBRARY_PATH="+m.nativeLibraryPath)
	}

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
		return nil, errutil.Wrapf(err, "optimizer process failed: %s", strings.TrimSpace(string(stderrBytes)))
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
