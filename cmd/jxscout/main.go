package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/francisconeves97/jxscout/internal/cli"
	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/mcp"
	"github.com/francisconeves97/jxscout/internal/settings"
	"github.com/francisconeves97/jxscout/pkg/constants"
	"github.com/francisconeves97/jxscout/pkg/jxscout"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"

	"github.com/projectdiscovery/goflags"
)

const Version = constants.Version

func main() {
	// Pro v2 client-mode compatibility: `jxscout -c <command> [flags]`
	// (agent skills invoke `jxscout -c create-finding ...` etc.)
	if len(os.Args) > 2 && os.Args[1] == "-c" {
		os.Args = append([]string{os.Args[0], os.Args[2]}, os.Args[3:]...)
	}

	// Check if running as subcommand (wordlist, query, fs-ingest, backup, mcp)
	if len(os.Args) > 1 {
		subcommand := os.Args[1]
		switch subcommand {
		case "wordlist", "query", "fs-ingest", "backup", "create-finding", "list-findings", "print-full-project-settings", "repeater", "monitor":
			// Run CLI tool
			if err := cli.Execute(); err != nil {
				fmt.Fprintf(os.Stderr, "Error: %v\n", err)
				os.Exit(1)
			}
			return
		case "mcp":
			// Run MCP server
			mcpCmd := mcp.NewMCPCommand()
			if err := mcpCmd.Execute(); err != nil {
				fmt.Fprintf(os.Stderr, "Error: %v\n", err)
				os.Exit(1)
			}
			return
		case "help", "-h", "--help":
			printHelp()
			return
		case "version", "-v", "--version":
			fmt.Printf("jxscout %s\n", Version)
			return
		}
		// Fall through to proxy mode if not a known subcommand
	}

	// Default: Run proxy server with goflags
	runProxy()
}

func printHelp() {
	fmt.Println(`jxscout - JavaScript reconnaissance tool

USAGE:
  jxscout [flags]                    Start interactive TUI proxy server (default)
  jxscout wordlist [flags]           Extract wordlists from analyzed assets
  jxscout query [flags]              Query assets and analysis results
  jxscout fs-ingest [flags]          Ingest local files/folders into project
  jxscout backup [flags]             Backup project to archive
  jxscout create-finding [flags]     Create a structured security finding
  jxscout list-findings [flags]      List structured security findings
  jxscout monitor [flags]            Manage scheduled monitors (create/list/send-test-notifications)
  jxscout mcp [flags]                Start MCP server for AI assistant integration

PROXY SERVER FLAGS:
  Run 'jxscout --help' to see all proxy configuration flags

CLI TOOL FLAGS:
  Run 'jxscout <command> --help' for command-specific flags

EXAMPLES:
  jxscout --project-name myapp       Start proxy for 'myapp' project
  jxscout wordlist --type paths      Extract path wordlist
  jxscout mcp --http --port 9998     Start MCP HTTP server
`)
}

func runProxy() {
	options := jxscouttypes.Options{}

	// Load settings first (if project name is known or default)
	// Settings act as defaults, flags override
	projectName := constants.DefaultProjectName
	for i, arg := range os.Args {
		if (arg == "--project-name" || arg == "-p") && i+1 < len(os.Args) {
			projectName = os.Args[i+1]
			break
		}
	}
	if projectName == constants.DefaultProjectName {
		if pn, err := common.GetProjectName(); err == nil {
			projectName = pn
		}
	}

	// Load settings (will use defaults if not found)
	loader := settings.NewSettingsLoader(projectName)
	if s, err := loader.LoadSettings(); err == nil {
		applySettingsToOptions(s, &options)
	} else {
		// Settings not found - use defaults
		applyDefaults(&options)
	}

	flagSet := goflags.NewFlagSet()

	flagSet.SetDescription("jxscout | static files downloader for vulnerability analysis")

	flagSet.CreateGroup("server", "server configuration",
		flagSet.StringVar(&options.Hostname, constants.FlagHostname, options.Hostname, constants.DescriptionHostname),
		flagSet.IntVar(&options.Port, constants.FlagPort, options.Port, constants.DescriptionPort),
	)

	flagSet.CreateGroup("jxscout", "jxscout configuration",
		flagSet.BoolVar(&options.Monitoring, constants.FlagMonitoring, options.Monitoring, constants.DescriptionMonitoring),
		flagSet.StringVar(&options.ProjectName, constants.FlagProjectName, options.ProjectName, constants.DescriptionProjectName),
		flagSet.StringSliceVar(&options.ScopePatterns, constants.FlagScope, options.ScopePatterns, constants.DescriptionScope, goflags.FileCommaSeparatedStringSliceOptions),
		flagSet.BoolVar(&options.Debug, constants.FlagDebug, options.Debug, constants.DescriptionDebug),
	)

	flagSet.CreateGroup("concurrency", "concurrency configuration",
		flagSet.IntVar(&options.AssetFetchConcurrency, constants.FlagAssetFetchConcurrency, options.AssetFetchConcurrency, constants.DescriptionAssetFetchConcurrency),
		flagSet.IntVar(&options.AssetSaveConcurrency, constants.FlagAssetSaveConcurrency, options.AssetSaveConcurrency, constants.DescriptionAssetSaveConcurrency),
		flagSet.IntVar(&options.BeautifierConcurrency, constants.FlagBeautifierConcurrency, options.BeautifierConcurrency, constants.DescriptionBeautifierConcurrency),
		flagSet.IntVar(&options.ChunkDiscovererConcurrency, constants.FlagChunkDiscovererConcurrency, options.ChunkDiscovererConcurrency, constants.DescriptionChunkDiscovererConcurrency),
		flagSet.IntVar(&options.ASTAnalyzerConcurrency, constants.FlagASTAnalyzerConcurrency, options.ASTAnalyzerConcurrency, constants.DescriptionASTAnalyzerConcurrency),
		flagSet.IntVar(&options.OptimizerConcurrency, constants.FlagOptimizerConcurrency, options.OptimizerConcurrency, constants.DescriptionOptimizerConcurrency),
		flagSet.IntVar(&options.UnpackerConcurrency, constants.FlagUnpackerConcurrency, options.UnpackerConcurrency, constants.DescriptionUnpackerConcurrency),
	)

	flagSet.CreateGroup("chunk discovery", "chunk discovery configuration",
		flagSet.IntVar(&options.ChunkDiscovererBruteForceLimit, constants.FlagChunkDiscovererBruteForceLimit, options.ChunkDiscovererBruteForceLimit, constants.DescriptionChunkDiscovererBruteForceLimit),
	)

	flagSet.CreateGroup("cache", "cache configuration",
		flagSet.DurationVar(&options.JavascriptRequestsCacheTTL, constants.FlagJavascriptRequestsCacheTTL, options.JavascriptRequestsCacheTTL, constants.DescriptionJavascriptRequestsCacheTTL),
		flagSet.DurationVar(&options.HTMLRequestsCacheTTL, constants.FlagHTMLRequestsCacheTTL, options.HTMLRequestsCacheTTL, constants.DescriptionHTMLRequestsCacheTTL),
	)

	flagSet.CreateGroup("rate limiting", "rate limiting configuration",
		flagSet.IntVar(&options.RateLimitingMaxRequestsPerSecond, constants.FlagRateLimitingMaxRequestsPerSecond, options.RateLimitingMaxRequestsPerSecond, constants.DescriptionRateLimitingMaxRequestsPerSecond),
		flagSet.IntVar(&options.RateLimitingMaxRequestsPerMinute, constants.FlagRateLimitingMaxRequestsPerMinute, options.RateLimitingMaxRequestsPerMinute, constants.DescriptionRateLimitingMaxRequestsPerMinute),
	)

	flagSet.CreateGroup("js ingestion", "js ingestion configuration",
		flagSet.BoolVar(&options.DownloadReferedJS, constants.FlagDownloadReferedJS, options.DownloadReferedJS, constants.DescriptionDownloadReferedJS),
	)

	flagSet.CreateGroup("logging", "logging configuration",
		flagSet.IntVar(&options.LogBufferSize, constants.FlagLogBufferSize, options.LogBufferSize, constants.DescriptionLogBufferSize),
		flagSet.IntVar(&options.LogFileMaxSizeMB, constants.FlagLogFileMaxSizeMB, options.LogFileMaxSizeMB, constants.DescriptionLogFileMaxSizeMB),
	)

	flagSet.CreateGroup("memory", "memory configuration",
		flagSet.IntVar(&options.MemoryLimitMB, constants.FlagMemoryLimitMB, options.MemoryLimitMB, constants.DescriptionMemoryLimitMB),
		flagSet.DurationVar(&options.MemoryUsageCheckInterval, constants.FlagMemoryUsageCheckInterval, options.MemoryUsageCheckInterval, constants.DescriptionMemoryUsageCheckInterval),
		flagSet.IntVar(&options.BeautifierMemoryUsageLimitMB, constants.FlagBeautifierMemoryUsageLimitMB, options.BeautifierMemoryUsageLimitMB, constants.DescriptionBeautifierMemoryUsageLimitMB),
		flagSet.IntVar(&options.ChunkDiscovererMemoryUsageLimitMB, constants.FlagChunkDiscovererMemoryUsageLimitMB, options.ChunkDiscovererMemoryUsageLimitMB, constants.DescriptionChunkDiscovererMemoryUsageLimitMB),
		flagSet.IntVar(&options.ASTAnalyzerMemoryUsageLimitMB, constants.FlagASTAnalyzerMemoryUsageLimitMB, options.ASTAnalyzerMemoryUsageLimitMB, constants.DescriptionASTAnalyzerMemoryUsageLimitMB),
		flagSet.IntVar(&options.SourceMapDiscovererMemoryUsageLimitMB, constants.FlagSourceMapDiscovererMemoryUsageLimitMB, options.SourceMapDiscovererMemoryUsageLimitMB, constants.DescriptionSourceMapDiscovererMemoryUsageLimitMB),
		flagSet.IntVar(&options.OptimizerMemoryUsageLimitMB, constants.FlagOptimizerMemoryUsageLimitMB, options.OptimizerMemoryUsageLimitMB, constants.DescriptionOptimizerMemoryUsageLimitMB),
		flagSet.IntVar(&options.UnpackerMemoryUsageLimitMB, constants.FlagUnpackerMemoryUsageLimitMB, options.UnpackerMemoryUsageLimitMB, constants.DescriptionUnpackerMemoryUsageLimitMB),
		flagSet.IntVar(&options.FilesystemIngestionFilesPerSecond, constants.FlagFilesystemIngestionFilesPerSecond, options.FilesystemIngestionFilesPerSecond, constants.DescriptionFilesystemIngestionFilesPerSecond),
	)

	flagSet.CreateGroup("features", "feature toggles",
		flagSet.BoolVar(&options.EnableOptimizer, constants.FlagEnableOptimizer, options.EnableOptimizer, constants.DescriptionEnableOptimizer),
		flagSet.BoolVar(&options.EnableUnpacker, constants.FlagEnableUnpacker, options.EnableUnpacker, constants.DescriptionEnableUnpacker),
	)

	flagSet.CreateGroup("chunk discovery", "chunk discovery configuration",
		flagSet.BoolVar(&options.DiscoverGoogleLazyChunks, constants.FlagDiscoverGoogleLazyChunks, options.DiscoverGoogleLazyChunks, constants.DescriptionDiscoverGoogleLazyChunks),
	)

	flagSet.CreateGroup("mcp", "mcp server configuration",
		flagSet.StringVar(&options.MCPServerHostname, constants.FlagMCPServerHostname, options.MCPServerHostname, constants.DescriptionMCPServerHostname),
		flagSet.IntVar(&options.MCPServerPort, constants.FlagMCPServerPort, options.MCPServerPort, constants.DescriptionMCPServerPort),
	)

	flagSet.CreateGroup("overrides", "overrides configuration",
		flagSet.StringVar(&options.CaidoHostname, constants.FlagCaidoHostname, options.CaidoHostname, constants.DescriptionCaidoHostname),
		flagSet.IntVar(&options.CaidoPort, constants.FlagCaidoPort, options.CaidoPort, constants.DescriptionCaidoPort),
		flagSet.DurationVar(&options.OverrideContentCheckInterval, constants.FlagOverrideContentCheckInterval, options.OverrideContentCheckInterval, constants.DescriptionOverrideContentCheckInterval),
	)

	err := jxscout.CheckAndMigrateOldVersion()
	if err != nil {
		log.Fatalf("failed to check and migrate old version: %s", err.Error())
	}

	configFileLocation := filepath.Join(common.GetPrivateDirectory(options.ProjectName), constants.ConfigFileName)
	flagSet.SetConfigFilePath(configFileLocation)

	if err := flagSet.Parse(); err != nil {
		log.Fatalf("could not parse flags: %s", err.Error())
	}

	jxscout, err := jxscout.NewJXScout(options)
	if err != nil {
		flagSet.CommandLine.PrintDefaults()
		log.Fatalf("failed to initialize jxscout: %s", err.Error())
	}

	err = jxscout.Start()
	if err != nil {
		log.Fatalf("failed to start jxscout: %s", err.Error())
	}
}

func applySettingsToOptions(s *settings.Settings, o *jxscouttypes.Options) {
	// Server
	if v, ok := s.GetString("server.hostname"); ok {
		o.Hostname = v
	}
	if v, ok := s.GetInt("server.port"); ok {
		o.Port = v
	}

	// Project
	if v, ok := s.GetString("project.name"); ok {
		o.ProjectName = v
	}
	if v, ok := s.Get("project.scope_patterns"); ok {
		if arr, ok := v.([]interface{}); ok {
			patterns := make([]string, 0, len(arr))
			for _, p := range arr {
				if str, ok := p.(string); ok {
					patterns = append(patterns, str)
				}
			}
			o.ScopePatterns = patterns
		}
	}
	if v, ok := s.GetBool("project.debug"); ok {
		o.Debug = v
	}

	// Concurrency
	if v, ok := s.GetInt("concurrency.asset_fetch"); ok {
		o.AssetFetchConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.asset_save"); ok {
		o.AssetSaveConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.beautifier"); ok {
		o.BeautifierConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.chunk_discoverer"); ok {
		o.ChunkDiscovererConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.ast_analyzer"); ok {
		o.ASTAnalyzerConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.optimizer"); ok {
		o.OptimizerConcurrency = v
	}
	if v, ok := s.GetInt("concurrency.unpacker"); ok {
		o.UnpackerConcurrency = v
	}

	// Chunk discovery
	if v, ok := s.GetInt("chunk_discovery.brute_force_limit"); ok {
		o.ChunkDiscovererBruteForceLimit = v
	}
	if v, ok := s.GetBool("chunk_discovery.google_lazy_chunks"); ok {
		o.DiscoverGoogleLazyChunks = v
	}

	// Cache (duration parsing not implemented yet)
	_, _ = s.GetString("cache.js_requests_ttl")
	_, _ = s.GetString("cache.html_requests_ttl")

	// Rate limiting
	if v, ok := s.GetInt("rate_limiting.max_requests_per_second"); ok {
		o.RateLimitingMaxRequestsPerSecond = v
	}
	if v, ok := s.GetInt("rate_limiting.max_requests_per_minute"); ok {
		o.RateLimitingMaxRequestsPerMinute = v
	}

	// JS ingestion
	if v, ok := s.GetBool("features.optimizer_enabled"); ok {
		o.EnableOptimizer = v
	}
	if v, ok := s.GetBool("features.unpacker_enabled"); ok {
		o.EnableUnpacker = v
	}
	_, _ = s.GetBool("features.screenshots_enabled")
	_, _ = s.GetBool("features.hooks_enabled")

	// Memory
	if v, ok := s.GetInt("memory.limit_mb"); ok {
		o.MemoryLimitMB = v
	}
	// Duration parsing for check_interval
	if v, ok := s.GetInt("memory.beautifier_limit_mb"); ok {
		o.BeautifierMemoryUsageLimitMB = v
	}
	if v, ok := s.GetInt("memory.chunk_discoverer_limit_mb"); ok {
		o.ChunkDiscovererMemoryUsageLimitMB = v
	}
	if v, ok := s.GetInt("memory.ast_analyzer_limit_mb"); ok {
		o.ASTAnalyzerMemoryUsageLimitMB = v
	}
	if v, ok := s.GetInt("memory.optimizer_limit_mb"); ok {
		o.OptimizerMemoryUsageLimitMB = v
	}
	if v, ok := s.GetInt("memory.unpacker_limit_mb"); ok {
		o.UnpackerMemoryUsageLimitMB = v
	}

	// MCP
	if v, ok := s.GetString("mcp.hostname"); ok {
		o.MCPServerHostname = v
	}
	if v, ok := s.GetInt("mcp.port"); ok {
		o.MCPServerPort = v
	}

	// Overrides
	if v, ok := s.GetString("overrides.caido_hostname"); ok {
		o.CaidoHostname = v
	}
	if v, ok := s.GetInt("overrides.caido_port"); ok {
		o.CaidoPort = v
	}
	if v, ok := s.GetString("overrides.check_interval"); ok {
		if d, err := time.ParseDuration(v); err == nil {
			o.OverrideContentCheckInterval = d
		}
	}

	// Proxy rotation
	// Screenshots
}

func applyDefaults(o *jxscouttypes.Options) {
	o.Hostname = constants.DefaultHostname
	o.Port = constants.DefaultPort
	o.ProjectName = constants.DefaultProjectName
	o.ScopePatterns = nil
	o.Debug = constants.DefaultDebug
	o.AssetFetchConcurrency = constants.DefaultAssetFetchConcurrency
	o.AssetSaveConcurrency = constants.DefaultAssetSaveConcurrency
	o.BeautifierConcurrency = constants.DefaultBeautifierConcurrency
	o.ChunkDiscovererConcurrency = constants.DefaultChunkDiscovererConcurrency
	o.ASTAnalyzerConcurrency = constants.DefaultASTAnalyzerConcurrency
	o.OptimizerConcurrency = constants.DefaultOptimizerConcurrency
	o.UnpackerConcurrency = constants.DefaultUnpackerConcurrency
	o.ChunkDiscovererBruteForceLimit = constants.DefaultChunkDiscovererBruteForceLimit
	o.JavascriptRequestsCacheTTL = constants.DefaultJavascriptRequestsCacheTTL
	o.HTMLRequestsCacheTTL = constants.DefaultHTMLRequestsCacheTTL
	o.RateLimitingMaxRequestsPerSecond = constants.DefaultRateLimitingMaxRequestsPerSecond
	o.RateLimitingMaxRequestsPerMinute = constants.DefaultRateLimitingMaxRequestsPerMinute
	o.DownloadReferedJS = constants.DefaultDownloadReferedJS
	o.LogBufferSize = constants.DefaultLogBufferSize
	o.LogFileMaxSizeMB = constants.DefaultLogFileMaxSizeMB
	o.MemoryLimitMB = constants.DefaultMemoryLimitMB
	o.MemoryUsageCheckInterval = constants.DefaultMemoryUsageCheckInterval
	o.BeautifierMemoryUsageLimitMB = constants.DefaultBeautifierMemoryUsageLimitMB
	o.ChunkDiscovererMemoryUsageLimitMB = constants.DefaultChunkDiscovererMemoryUsageLimitMB
	o.ASTAnalyzerMemoryUsageLimitMB = constants.DefaultASTAnalyzerMemoryUsageLimitMB
	o.SourceMapDiscovererMemoryUsageLimitMB = constants.DefaultSourceMapDiscovererMemoryUsageLimitMB
	o.OptimizerMemoryUsageLimitMB = constants.DefaultOptimizerMemoryUsageLimitMB
	o.UnpackerMemoryUsageLimitMB = constants.DefaultUnpackerMemoryUsageLimitMB
	o.FilesystemIngestionFilesPerSecond = constants.DefaultFilesystemIngestionFilesPerSecond
	o.EnableOptimizer = constants.DefaultEnableOptimizer
	o.EnableUnpacker = constants.DefaultEnableUnpacker
	o.DiscoverGoogleLazyChunks = constants.DefaultDiscoverGoogleLazyChunks
	o.MCPServerHostname = constants.DefaultMCPServerHostname
	o.MCPServerPort = constants.DefaultMCPServerPort
	o.CaidoHostname = constants.DefaultCaidoHostname
	o.CaidoPort = constants.DefaultCaidoPort
	o.OverrideContentCheckInterval = constants.DefaultOverrideContentCheckInterval
}
