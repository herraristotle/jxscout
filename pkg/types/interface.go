package jxscouttypes

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	assetfetcher "github.com/francisconeves97/jxscout/internal/core/asset-fetcher"
	assetservice "github.com/francisconeves97/jxscout/internal/core/asset-service"
	dbeventbus "github.com/francisconeves97/jxscout/internal/core/dbeventbus"
	"github.com/francisconeves97/jxscout/internal/core/eventbus"
	"github.com/francisconeves97/jxscout/internal/core/websocket"

	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
	"github.com/projectdiscovery/goflags"
)

// HTTPServer interface
type HTTPServer interface {
	SendSuccessResponse(w http.ResponseWriter, status int, result any)
	SendErrorResponse(w http.ResponseWriter, message string, status int)
}

// EventBus interface
type EventBus = eventbus.EventBus
type DBEventBus = *dbeventbus.EventBus
type EventBusMessage = eventbus.Message

// Router interface
type Router = chi.Router

// Scope interface
type Scope interface {
	IsInScope(url string) bool
}

// Cache interface

// JXScout Options
type Options struct {
	Port                             int                 `yaml:"port"`
	Hostname                         string              `yaml:"hostname"`
	ProjectName                      string              `yaml:"project-name"`
	ScopePatterns                    goflags.StringSlice `yaml:"scope"`
	Debug                            bool                `yaml:"debug"`
	AssetSaveConcurrency             int                 `yaml:"save-concurrency"`
	AssetFetchConcurrency            int                 `yaml:"fetch-concurrency"`
	BeautifierConcurrency            int                 `yaml:"beautifier-concurrency"`
	ChunkDiscovererConcurrency       int                 `yaml:"chunk-discoverer-concurrency"`
	ASTAnalyzerConcurrency           int                 `yaml:"ast-analyzer-concurrency"`
	OptimizerConcurrency             int                 `yaml:"optimizer-concurrency"`
	UnpackerConcurrency              int                 `yaml:"unpacker-concurrency"`
	ChunkDiscovererBruteForceLimit   int                 `yaml:"chunk-discoverer-bruteforce-limit"`
	JavascriptRequestsCacheTTL       time.Duration       `yaml:"js-requests-cache-ttl"`
	HTMLRequestsCacheTTL             time.Duration       `yaml:"html-requests-cache-ttl"`
	RateLimitingMaxRequestsPerSecond int                 `yaml:"rate-limiter-max-requests-per-second"`
	RateLimitingMaxRequestsPerMinute int                 `yaml:"rate-limiter-max-requests-per-minute"`
	DownloadReferedJS                bool                `yaml:"download-refered-js"`
	LogBufferSize                    int                 `yaml:"log-buffer-size"`
	LogFileMaxSizeMB                 int                 `yaml:"log-file-max-size-mb"`
	CaidoHostname                    string              `yaml:"caido-hostname"`
	CaidoPort                        int                 `yaml:"caido-port"`
	OverrideContentCheckInterval     time.Duration       `yaml:"override-content-check-interval"`
	EnableOptimizer                  bool                `yaml:"enable-optimizer"`
	EnableUnpacker                   bool                `yaml:"enable-unpacker"`
	MemoryLimitMB                    int                 `yaml:"memory-limit-mb"`
	MemoryUsageCheckInterval         time.Duration       `yaml:"memory-usage-check-interval"`
	BeautifierMemoryUsageLimitMB     int                 `yaml:"beautifier-memory-usage-limit-mb"`
	ChunkDiscovererMemoryUsageLimitMB int                `yaml:"chunk-discoverer-memory-usage-limit-mb"`
	ASTAnalyzerMemoryUsageLimitMB    int                 `yaml:"ast-analyzer-memory-usage-limit-mb"`
	SourceMapDiscovererMemoryUsageLimitMB int            `yaml:"source-map-discoverer-memory-usage-limit-mb"`
	OptimizerMemoryUsageLimitMB      int                 `yaml:"optimizer-memory-usage-limit-mb"`
	UnpackerMemoryUsageLimitMB       int                 `yaml:"unpacker-memory-usage-limit-mb"`
	FilesystemIngestionFilesPerSecond int                `yaml:"filesystem-ingestion-files-per-second"`
	MCPServerHostname                string              `yaml:"mcp-server-hostname"`
	MCPServerPort                    int                 `yaml:"mcp-server-port"`
	DiscoverGoogleLazyChunks         bool                `yaml:"discover-google-lazy-chunks"`
	CustomAnalyzersPath              string              `yaml:"custom-analyzers-path"`
	SkipScriptPath                   string              `yaml:"skip-script-path"`

	// Proxy rotation
	ProxyListFile         string `yaml:"proxy-list-file"`
	ProxyRotationStrategy string `yaml:"proxy-rotation-strategy"`
	ProxyMaxFailures      int    `yaml:"proxy-max-failures"`

	// Per-host rate limiting
	RateLimitConfigFile string `yaml:"rate-limit-config-file"`

	// Screenshots
	EnableScreenshots     bool          `yaml:"enable-screenshots"`
	ScreenshotConcurrency int           `yaml:"screenshot-concurrency"`
	ScreenshotTimeout     time.Duration `yaml:"screenshot-timeout"`
	ScreenshotViewport    string        `yaml:"screenshot-viewport"`
}

// AssetService interface
type AssetService = assetservice.AssetService
type Asset = assetservice.Asset

// AssetFetcher interface
type AssetFetcher = assetfetcher.AssetFetcher

type FileService = assetservice.FileService

// ModuleSDK are the exposed dependencies that modules can use
type ModuleSDK struct {
	Ctx              context.Context
	InMemoryEventBus EventBus
	DBEventBus       DBEventBus
	Router           Router
	AssetService     AssetService
	AssetFetcher     AssetFetcher
	Options          Options
	HTTPServer       HTTPServer
	WebsocketServer  *websocket.WebsocketServer // used to communitate with VSCode
	Logger           *slog.Logger
	Scope            Scope
	FileService      FileService
	Database         *sqlx.DB
}

type Module interface {
	Initialize(sdk *ModuleSDK) error
}

type JXScout interface {
	Start() error
	RegisterModule(Module) error
}
