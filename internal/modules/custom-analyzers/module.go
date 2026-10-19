package customanalyzers

import (
	_ "embed"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/dbeventbus"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
)

//go:embed custom_analyzer.js
var customAnalyzerBinary []byte

const topicBeautifierAssetSaved = "beautifier.asset_saved"

type CustomAnalyzerModule struct {
	sdk                      *jxscouttypes.ModuleSDK
	customAnalyzerBinaryPath string
	configPath               string
	skipScriptPath           string
}

func NewCustomAnalyzerModule() *CustomAnalyzerModule {
	return &CustomAnalyzerModule{}
}

func (m *CustomAnalyzerModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	saveDir := filepath.Join(common.GetPrivateDirectoryRoot(), "analyzers")
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		return errutil.Wrap(err, "failed to create custom analyzers directory")
	}

	binaryPath := filepath.Join(saveDir, "custom_analyzer.js")
	if err := os.WriteFile(binaryPath, customAnalyzerBinary, 0755); err != nil {
		return errutil.Wrap(err, "failed to write custom analyzer file")
	}
	m.customAnalyzerBinaryPath = binaryPath

	m.configPath = filepath.Join(saveDir, "analyzers.json")
	if sdk.Options.CustomAnalyzersPath != "" {
		candidate := sdk.Options.CustomAnalyzersPath
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			m.configPath = candidate
		}
	}

	m.skipScriptPath = sdk.Options.SkipScriptPath

	go func() {
		if err := m.subscribeBeautifiedAssets(); err != nil {
			sdk.Logger.Error("failed to subscribe to beautified assets for custom analyzers", "err", err)
		}
	}()

	return nil
}

type CustomAnalyzerConfig struct {
	RegexAnalyzers   []RegexAnalyzerConfig   `json:"regex_analyzers"`
	DerivedAnalyzers []DerivedAnalyzerConfig `json:"derived_analyzers"`
	ScriptAnalyzers  []ScriptAnalyzerConfig  `json:"script_analyzers"`
}

type RegexAnalyzerConfig struct {
	Name        string `json:"name"`
	Pattern     string `json:"pattern"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Enabled     bool   `json:"enabled"`
}

type DerivedAnalyzerConfig struct {
	Name        string   `json:"name"`
	BaseTypes   []string `json:"base_types"`
	Condition   string   `json:"condition"` // "any" (default) or "all"
	Description string   `json:"description"`
	Enabled     bool     `json:"enabled"`
}

type ScriptAnalyzerConfig struct {
	Name        string `json:"name"`
	ScriptPath  string `json:"script_path"`
	Description string `json:"description"`
	Enabled     bool   `json:"enabled"`
}

func (m *CustomAnalyzerModule) subscribeBeautifiedAssets() error {
	return m.sdk.DBEventBus.Subscribe(m.sdk.Ctx, topicBeautifierAssetSaved, "custom-analyzers", func(ctx context.Context, payload []byte) error {
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

		content, err := os.ReadFile(asset.Path)
		if err != nil {
			return errutil.Wrapf(err, "failed to read asset: %s", asset.Path)
		}

		if m.skipScriptPath != "" {
			shouldSkip, err := m.runSkipScript(ctx, asset)
			if err != nil {
				m.sdk.Logger.Error("skip script error", "err", err)
			} else if shouldSkip {
				m.sdk.Logger.Debug("skipping analysis per skip script", "asset", asset.URL)
				return nil
			}
		}

		matches, err := m.runCustomAnalyzers(ctx, asset, string(content))
		if err != nil {
			return errutil.Wrapf(err, "failed to run custom analyzers on asset: %s", asset.Path)
		}

		if len(matches) > 0 {
			if err := m.storeMatches(ctx, asset, matches); err != nil {
				return dbeventbus.NewRetriableError(errutil.Wrap(err, "failed to store custom analyzer matches"))
			}
		}

		return nil
	}, dbeventbus.Options{
		Concurrency:       5,
		MaxRetries:        3,
		Backoff:           common.ExponentialBackoff,
		PollInterval:      1 * time.Second,
		HeartbeatInterval: 10 * time.Second,
	})
}

func (m *CustomAnalyzerModule) runSkipScript(ctx context.Context, asset assetservice.Asset) (bool, error) {
	if m.skipScriptPath == "" {
		return false, nil
	}

	cmd := exec.CommandContext(ctx, "bun", "run", m.skipScriptPath)
	cmd.Stdin = strings.NewReader(fmt.Sprintf(`{"file_type":%q,"url":%q,"file_path":%q}`,
		asset.ContentType, asset.URL, asset.Path))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, errutil.Wrap(err, "skip script execution failed")
	}

	return strings.TrimSpace(string(output)) == "skip", nil
}

// CustomAnalyzerMatch mirrors astanalyzer.AnalyzerMatch so the UI and CLI read both alike.
type CustomAnalyzerMatch struct {
	FilePath     string          `json:"filePath"`
	AnalyzerName string          `json:"analyzerName"`
	Value        string          `json:"value"`
	Start        Position        `json:"start"`
	End          Position        `json:"end"`
	Tags         map[string]bool `json:"tags"`
	Extra        map[string]any  `json:"extra"`
}

type Position struct {
	Line   int64 `json:"line"`
	Column int64 `json:"column"`
}

func (m *CustomAnalyzerModule) runCustomAnalyzers(ctx context.Context, asset assetservice.Asset, content string) ([]CustomAnalyzerMatch, error) {
	config, err := m.loadConfig(m.configPath)
	if err != nil {
		return nil, err
	}

	var allMatches []CustomAnalyzerMatch

	for _, regexConfig := range config.RegexAnalyzers {
		if !regexConfig.Enabled {
			continue
		}
		allMatches = append(allMatches, m.runRegexAnalyzer(asset, content, regexConfig)...)
	}

	for _, scriptConfig := range config.ScriptAnalyzers {
		if !scriptConfig.Enabled {
			continue
		}
		matches, err := m.runScriptAnalyzer(ctx, asset, content, scriptConfig)
		if err != nil {
			m.sdk.Logger.Error("script analyzer failed", "name", scriptConfig.Name, "err", err)
			continue
		}
		allMatches = append(allMatches, matches...)
	}

	allMatches = append(allMatches, runDerivedAnalyzers(config.DerivedAnalyzers, allMatches)...)

	return allMatches, nil
}

func (m *CustomAnalyzerModule) runRegexAnalyzer(asset assetservice.Asset, content string, config RegexAnalyzerConfig) []CustomAnalyzerMatch {
	re, err := regexp.Compile(config.Pattern)
	if err != nil {
		m.sdk.Logger.Error("invalid regex pattern", "name", config.Name, "err", err)
		return nil
	}

	var results []CustomAnalyzerMatch
	for _, match := range re.FindAllStringIndex(content, -1) {
		line, column := positionAt(content, match[0])
		endLine, endColumn := positionAt(content, match[1])
		results = append(results, CustomAnalyzerMatch{
			FilePath:     asset.Path,
			AnalyzerName: "custom-" + config.Name,
			Value:        content[match[0]:match[1]],
			Start:        Position{Line: line, Column: column},
			End:          Position{Line: endLine, Column: endColumn},
			Tags: map[string]bool{
				"custom":                  true,
				"custom-regex":            true,
				"regex-" + config.Name:    true,
			},
			Extra: map[string]any{"description": config.Description, "severity": config.Severity},
		})
	}
	return results
}

// positionAt converts a byte offset into 1-based line and 0-based column, matching the AST analyzer.
func positionAt(content string, offset int) (int64, int64) {
	if offset > len(content) {
		offset = len(content)
	}
	line := int64(1)
	lastNewline := -1
	for i := 0; i < offset; i++ {
		if content[i] == '\n' {
			line++
			lastNewline = i
		}
	}
	return line, int64(offset - lastNewline - 1)
}

func (m *CustomAnalyzerModule) runScriptAnalyzer(ctx context.Context, asset assetservice.Asset, content string, config ScriptAnalyzerConfig) ([]CustomAnalyzerMatch, error) {
	input, err := json.Marshal(map[string]string{
		"content":  content,
		"url":      asset.URL,
		"filePath": asset.Path,
	})
	if err != nil {
		return nil, errutil.Wrap(err, "failed to marshal script analyzer input")
	}

	cmd := exec.CommandContext(ctx, "bun", "run", config.ScriptPath)
	cmd.Stdin = strings.NewReader(string(input))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, errutil.Wrap(err, "script analyzer execution failed")
	}

	var matches []CustomAnalyzerMatch
	if err := json.Unmarshal(output, &matches); err != nil {
		return nil, errutil.Wrap(err, "failed to parse script analyzer output")
	}

	for i := range matches {
		if matches[i].FilePath == "" {
			matches[i].FilePath = asset.Path
		}
		if matches[i].AnalyzerName == "" {
			matches[i].AnalyzerName = "custom-" + config.Name
		}
		if matches[i].Tags == nil {
			matches[i].Tags = map[string]bool{}
		}
		matches[i].Tags["custom"] = true
		matches[i].Tags["custom-script"] = true
	}

	return matches, nil
}

func runDerivedAnalyzers(configs []DerivedAnalyzerConfig, base []CustomAnalyzerMatch) []CustomAnalyzerMatch {
	var results []CustomAnalyzerMatch
	for _, config := range configs {
		if !config.Enabled || len(config.BaseTypes) == 0 {
			continue
		}

		valuesByType := map[string][]string{}
		for _, match := range base {
			valuesByType[match.AnalyzerName] = append(valuesByType[match.AnalyzerName], match.Value)
		}

		satisfied := 0
		var values []string
		for _, baseType := range config.BaseTypes {
			if vals, ok := valuesByType[baseType]; ok && len(vals) > 0 {
				satisfied++
				values = append(values, vals...)
			}
		}

		required := len(config.BaseTypes)
		if strings.EqualFold(config.Condition, "any") || config.Condition == "" {
			required = 1
		}
		if satisfied < required {
			continue
		}

		tags := map[string]bool{"custom": true, "custom-derived": true, "derived-" + config.Name: true}
		for _, baseType := range config.BaseTypes {
			tags["based-on-"+baseType] = true
		}

		results = append(results, CustomAnalyzerMatch{
			FilePath:     base[0].FilePath,
			AnalyzerName: "custom-" + config.Name,
			Value:        strings.Join(values, " "),
			Tags:         tags,
			Extra:        map[string]any{"description": config.Description},
		})
	}
	return results
}

func (m *CustomAnalyzerModule) loadConfig(path string) (*CustomAnalyzerConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &CustomAnalyzerConfig{}, nil
		}
		return nil, errutil.Wrap(err, "failed to read custom analyzers config")
	}

	var config CustomAnalyzerConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, errutil.Wrap(err, "failed to parse custom analyzers config")
	}

	return &config, nil
}

// storeMatches keeps custom results in their own row so the built-in analyzer version check never clobbers them.
func (m *CustomAnalyzerModule) storeMatches(ctx context.Context, asset assetservice.Asset, matches []CustomAnalyzerMatch) error {
	results, err := json.Marshal(matches)
	if err != nil {
		return errutil.Wrap(err, "failed to marshal custom analyzer matches")
	}

	_, err = m.sdk.Database.ExecContext(ctx, `
		INSERT INTO ast_analysis_results (asset_id, asset_type, asset_path, analyzer_version, results)
		VALUES (?, 'custom', ?, 1, ?)
		ON CONFLICT(asset_id, asset_type) DO UPDATE SET
			asset_path = excluded.asset_path,
			results = excluded.results,
			updated_at = CURRENT_TIMESTAMP
	`, asset.ID, asset.Path, string(results))
	if err != nil {
		return errutil.Wrap(err, "failed to insert custom analyzer matches")
	}

	return nil
}
