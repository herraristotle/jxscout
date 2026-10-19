package main

import (
	"log"
	"path/filepath"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/pkg/constants"
	"github.com/francisconeves97/jxscout/pkg/jxscout"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"

	"github.com/projectdiscovery/goflags"
)

const Version = constants.Version

func main() {
	options := jxscouttypes.Options{}

	flagSet := goflags.NewFlagSet()

	flagSet.SetDescription("jxscout | static files downloader for vulnerability analysis")

	flagSet.CreateGroup("server", "server configuration",
		flagSet.StringVar(&options.Hostname, constants.FlagHostname, constants.DefaultHostname, constants.DescriptionHostname),
		flagSet.IntVar(&options.Port, constants.FlagPort, constants.DefaultPort, constants.DescriptionPort),
	)

	flagSet.CreateGroup("jxscout", "jxscout configuration",
		flagSet.StringVar(&options.ProjectName, constants.FlagProjectName, constants.DefaultProjectName, constants.DescriptionProjectName),
		flagSet.StringSliceVar(&options.ScopePatterns, constants.FlagScope, nil, constants.DescriptionScope, goflags.FileCommaSeparatedStringSliceOptions),
		flagSet.BoolVar(&options.Debug, constants.FlagDebug, constants.DefaultDebug, constants.DescriptionDebug),
	)

	flagSet.CreateGroup("concurrency", "concurrency configuration",
		flagSet.IntVar(&options.AssetFetchConcurrency, constants.FlagAssetFetchConcurrency, constants.DefaultAssetFetchConcurrency, constants.DescriptionAssetFetchConcurrency),
		flagSet.IntVar(&options.AssetSaveConcurrency, constants.FlagAssetSaveConcurrency, constants.DefaultAssetSaveConcurrency, constants.DescriptionAssetSaveConcurrency),
		flagSet.IntVar(&options.BeautifierConcurrency, constants.FlagBeautifierConcurrency, constants.DefaultBeautifierConcurrency, constants.DescriptionBeautifierConcurrency),
		flagSet.IntVar(&options.ChunkDiscovererConcurrency, constants.FlagChunkDiscovererConcurrency, constants.DefaultChunkDiscovererConcurrency, constants.DescriptionChunkDiscovererConcurrency),
		flagSet.IntVar(&options.ASTAnalyzerConcurrency, constants.FlagASTAnalyzerConcurrency, constants.DefaultASTAnalyzerConcurrency, constants.DescriptionASTAnalyzerConcurrency),
		flagSet.IntVar(&options.OptimizerConcurrency, constants.FlagOptimizerConcurrency, constants.DefaultOptimizerConcurrency, constants.DescriptionOptimizerConcurrency),
		flagSet.IntVar(&options.UnpackerConcurrency, constants.FlagUnpackerConcurrency, constants.DefaultUnpackerConcurrency, constants.DescriptionUnpackerConcurrency),
	)

	flagSet.CreateGroup("chunk discovery", "chunk discovery configuration",
		flagSet.IntVar(&options.ChunkDiscovererBruteForceLimit, constants.FlagChunkDiscovererBruteForceLimit, constants.DefaultChunkDiscovererBruteForceLimit, constants.DescriptionChunkDiscovererBruteForceLimit),
	)

	flagSet.CreateGroup("cache", "cache configuration",
		flagSet.DurationVar(&options.JavascriptRequestsCacheTTL, constants.FlagJavascriptRequestsCacheTTL, constants.DefaultJavascriptRequestsCacheTTL, constants.DescriptionJavascriptRequestsCacheTTL),
		flagSet.DurationVar(&options.HTMLRequestsCacheTTL, constants.FlagHTMLRequestsCacheTTL, constants.DefaultHTMLRequestsCacheTTL, constants.DescriptionHTMLRequestsCacheTTL),
	)

	flagSet.CreateGroup("rate limiting", "rate limiting configuration",
		flagSet.IntVar(&options.RateLimitingMaxRequestsPerSecond, constants.FlagRateLimitingMaxRequestsPerSecond, constants.DefaultRateLimitingMaxRequestsPerSecond, constants.DescriptionRateLimitingMaxRequestsPerSecond),
		flagSet.IntVar(&options.RateLimitingMaxRequestsPerMinute, constants.FlagRateLimitingMaxRequestsPerMinute, constants.DefaultRateLimitingMaxRequestsPerMinute, constants.DescriptionRateLimitingMaxRequestsPerMinute),
	)

	flagSet.CreateGroup("js ingestion", "js ingestion configuration",
		flagSet.BoolVar(&options.DownloadReferedJS, constants.FlagDownloadReferedJS, constants.DefaultDownloadReferedJS, constants.DescriptionDownloadReferedJS),
	)

	flagSet.CreateGroup("logging", "logging configuration",
		flagSet.IntVar(&options.LogBufferSize, constants.FlagLogBufferSize, constants.DefaultLogBufferSize, constants.DescriptionLogBufferSize),
		flagSet.IntVar(&options.LogFileMaxSizeMB, constants.FlagLogFileMaxSizeMB, constants.DefaultLogFileMaxSizeMB, constants.DescriptionLogFileMaxSizeMB),
	)

	flagSet.CreateGroup("memory", "memory configuration",
		flagSet.IntVar(&options.MemoryLimitMB, constants.FlagMemoryLimitMB, constants.DefaultMemoryLimitMB, constants.DescriptionMemoryLimitMB),
		flagSet.DurationVar(&options.MemoryUsageCheckInterval, constants.FlagMemoryUsageCheckInterval, constants.DefaultMemoryUsageCheckInterval, constants.DescriptionMemoryUsageCheckInterval),
		flagSet.IntVar(&options.BeautifierMemoryUsageLimitMB, constants.FlagBeautifierMemoryUsageLimitMB, constants.DefaultBeautifierMemoryUsageLimitMB, constants.DescriptionBeautifierMemoryUsageLimitMB),
		flagSet.IntVar(&options.ChunkDiscovererMemoryUsageLimitMB, constants.FlagChunkDiscovererMemoryUsageLimitMB, constants.DefaultChunkDiscovererMemoryUsageLimitMB, constants.DescriptionChunkDiscovererMemoryUsageLimitMB),
		flagSet.IntVar(&options.ASTAnalyzerMemoryUsageLimitMB, constants.FlagASTAnalyzerMemoryUsageLimitMB, constants.DefaultASTAnalyzerMemoryUsageLimitMB, constants.DescriptionASTAnalyzerMemoryUsageLimitMB),
		flagSet.IntVar(&options.SourceMapDiscovererMemoryUsageLimitMB, constants.FlagSourceMapDiscovererMemoryUsageLimitMB, constants.DefaultSourceMapDiscovererMemoryUsageLimitMB, constants.DescriptionSourceMapDiscovererMemoryUsageLimitMB),
		flagSet.IntVar(&options.OptimizerMemoryUsageLimitMB, constants.FlagOptimizerMemoryUsageLimitMB, constants.DefaultOptimizerMemoryUsageLimitMB, constants.DescriptionOptimizerMemoryUsageLimitMB),
		flagSet.IntVar(&options.UnpackerMemoryUsageLimitMB, constants.FlagUnpackerMemoryUsageLimitMB, constants.DefaultUnpackerMemoryUsageLimitMB, constants.DescriptionUnpackerMemoryUsageLimitMB),
		flagSet.IntVar(&options.FilesystemIngestionFilesPerSecond, constants.FlagFilesystemIngestionFilesPerSecond, constants.DefaultFilesystemIngestionFilesPerSecond, constants.DescriptionFilesystemIngestionFilesPerSecond),
	)

	flagSet.CreateGroup("features", "feature toggles",
		flagSet.BoolVar(&options.EnableOptimizer, constants.FlagEnableOptimizer, constants.DefaultEnableOptimizer, constants.DescriptionEnableOptimizer),
		flagSet.BoolVar(&options.EnableUnpacker, constants.FlagEnableUnpacker, constants.DefaultEnableUnpacker, constants.DescriptionEnableUnpacker),
	)

	flagSet.CreateGroup("chunk discovery", "chunk discovery configuration",
		flagSet.BoolVar(&options.DiscoverGoogleLazyChunks, constants.FlagDiscoverGoogleLazyChunks, constants.DefaultDiscoverGoogleLazyChunks, constants.DescriptionDiscoverGoogleLazyChunks),
	)

	flagSet.CreateGroup("mcp", "mcp server configuration",
		flagSet.StringVar(&options.MCPServerHostname, constants.FlagMCPServerHostname, constants.DefaultMCPServerHostname, constants.DescriptionMCPServerHostname),
		flagSet.IntVar(&options.MCPServerPort, constants.FlagMCPServerPort, constants.DefaultMCPServerPort, constants.DescriptionMCPServerPort),
	)

	flagSet.CreateGroup("overrides", "overrides configuration",
		flagSet.StringVar(&options.CaidoHostname, constants.FlagCaidoHostname, constants.DefaultCaidoHostname, constants.DescriptionCaidoHostname),
		flagSet.IntVar(&options.CaidoPort, constants.FlagCaidoPort, constants.DefaultCaidoPort, constants.DescriptionCaidoPort),
		flagSet.DurationVar(&options.OverrideContentCheckInterval, constants.FlagOverrideContentCheckInterval, constants.DefaultOverrideContentCheckInterval, constants.DescriptionOverrideContentCheckInterval),
	)

	if options.ProjectName == constants.DefaultProjectName {
		projectName, err := common.GetProjectName()
		if err != nil {
			log.Fatalf("failed to get project name: %s", err.Error())
		}
		options.ProjectName = projectName
	}

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
