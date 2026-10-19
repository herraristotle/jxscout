package constants

import "time"

const (
	ConfigFileName = "config.yaml"
)

// Default values for jxscout options
const (
	// Server configuration
	DefaultPort     = 3333
	DefaultHostname = "localhost"

	// Jxscout configuration
	DefaultProjectName = "default"
	DefaultDebug       = false

	// Concurrency configuration
	DefaultAssetFetchConcurrency      = 5
	DefaultAssetSaveConcurrency       = 5
	DefaultBeautifierConcurrency      = 5
	DefaultChunkDiscovererConcurrency = 5
	DefaultASTAnalyzerConcurrency     = 5
	DefaultOptimizerConcurrency       = 2
	DefaultUnpackerConcurrency        = 5

	// Chunk discovery configuration
	DefaultChunkDiscovererBruteForceLimit = 3000

	// Memory configuration
	DefaultMemoryLimitMB                    = 8192
	DefaultMemoryUsageCheckInterval         = 5 * time.Second
	DefaultBeautifierMemoryUsageLimitMB     = 6144
	DefaultChunkDiscovererMemoryUsageLimitMB = 6144
	DefaultASTAnalyzerMemoryUsageLimitMB    = 6144
	DefaultSourceMapDiscovererMemoryUsageLimitMB = 6144
	DefaultOptimizerMemoryUsageLimitMB      = 6144
	DefaultUnpackerMemoryUsageLimitMB       = 6144
	DefaultFilesystemIngestionFilesPerSecond = 10
	DefaultDiscoverGoogleLazyChunks          = false
	DefaultCustomAnalyzersPath               = "analyzers"
	DefaultSkipScriptPath                    = ""

	DefaultJavascriptRequestsCacheTTL = 10 * time.Minute
	DefaultHTMLRequestsCacheTTL       = 10 * time.Minute

	// Rate limiting configuration
	DefaultRateLimitingMaxRequestsPerSecond = 2
	DefaultRateLimitingMaxRequestsPerMinute = 0

	// JS ingestion configuration
	DefaultDownloadReferedJS = false

	// Logging configuration
	DefaultLogBufferSize    = 10000
	DefaultLogFileMaxSizeMB = 10

	// Overrides configuration
	DefaultCaidoHostname                = "localhost"
	DefaultCaidoPort                    = 8080
	DefaultOverrideContentCheckInterval = time.Second * 5

	// Feature toggles
	DefaultEnableOptimizer = true
	DefaultEnableUnpacker  = false

	// MCP Server configuration
	DefaultMCPServerHostname = "localhost"
	DefaultMCPServerPort     = 0
)

// Flag names for jxscout options
const (
	// Server configuration
	FlagPort     = "port"
	FlagHostname = "hostname"

	// Jxscout configuration
	FlagProjectName = "project-name"
	FlagScope       = "scope"
	FlagDebug       = "debug"

	// Concurrency configuration
	FlagAssetFetchConcurrency      = "fetch-concurrency"
	FlagAssetSaveConcurrency       = "save-concurrency"
	FlagBeautifierConcurrency      = "beautifier-concurrency"
	FlagChunkDiscovererConcurrency = "chunk-discoverer-concurrency"
	FlagASTAnalyzerConcurrency     = "ast-analyzer-concurrency"
	FlagOptimizerConcurrency       = "optimizer-concurrency"
	FlagUnpackerConcurrency        = "unpacker-concurrency"

	// Chunk discovery configuration
	FlagChunkDiscovererBruteForceLimit = "chunk-discoverer-bruteforce-limit"

	// Cache configuration
	FlagJavascriptRequestsCacheTTL = "js-requests-cache-ttl"
	FlagHTMLRequestsCacheTTL       = "html-requests-cache-ttl"

	// Rate limiting configuration
	FlagRateLimitingMaxRequestsPerSecond = "rate-limiter-max-requests-per-second"
	FlagRateLimitingMaxRequestsPerMinute = "rate-limiter-max-requests-per-minute"

	// JS ingestion configuration
	FlagDownloadReferedJS = "download-refered-js"

	// Logging configuration
	FlagLogBufferSize    = "log-buffer-size"
	FlagLogFileMaxSizeMB = "log-file-max-size-mb"

	// Memory configuration
	FlagMemoryLimitMB                    = "memory-limit-mb"
	FlagMemoryUsageCheckInterval         = "memory-usage-check-interval"
	FlagBeautifierMemoryUsageLimitMB     = "beautifier-memory-usage-limit-mb"
	FlagChunkDiscovererMemoryUsageLimitMB = "chunk-discoverer-memory-usage-limit-mb"
	FlagASTAnalyzerMemoryUsageLimitMB    = "ast-analyzer-memory-usage-limit-mb"
	FlagSourceMapDiscovererMemoryUsageLimitMB = "source-map-discoverer-memory-usage-limit-mb"
	FlagOptimizerMemoryUsageLimitMB      = "optimizer-memory-usage-limit-mb"
	FlagUnpackerMemoryUsageLimitMB       = "unpacker-memory-usage-limit-mb"
	FlagFilesystemIngestionFilesPerSecond = "filesystem-ingestion-files-per-second"

	// Feature toggles
	FlagEnableOptimizer = "enable-optimizer"
	FlagEnableUnpacker  = "enable-unpacker"

	// Chunk discovery
	FlagDiscoverGoogleLazyChunks = "discover-google-lazy-chunks"

	// MCP Server configuration
	FlagMCPServerHostname = "mcp-server-hostname"
	FlagMCPServerPort     = "mcp-server-port"

	// Overrides configuration
	FlagCaidoHostname                = "caido-hostname"
	FlagCaidoPort                    = "caido-port"
	FlagOverrideContentCheckInterval = "override-content-check-interval"
)

// Descriptions for jxscout options
const (
	// Server configuration
	DescriptionHostname = "the hostname where jxscout will listen for requests"
	DescriptionPort     = "the port where jxscout will listen for requests"

	// Jxscout configuration
	DescriptionProjectName = "name of your project folder where downloaded files will be stored"
	DescriptionScope       = "comma-separated list of patterns to filter requests (e.g. *google*,*youtube*) or path to file containing patterns"
	DescriptionDebug       = "turn on detailed logs for troubleshooting"

	// Cache configuration
	DescriptionJavascriptRequestsCacheTTL = "how long to wait before re-downloading the same JS file"
	DescriptionHTMLRequestsCacheTTL       = "how long to wait before re-downloading the same HTML page"

	// Rate limiting configuration
	DescriptionRateLimitingMaxRequestsPerMinute = "max requests per minute for source maps and chunk discovery (0 = unlimited)"
	DescriptionRateLimitingMaxRequestsPerSecond = "max requests per second for source maps and chunk discovery (0 = unlimited)"

	// JS ingestion configuration
	DescriptionDownloadReferedJS = "download JS files from out-of-scope domains if they're linked from in-scope pages"

	// Logging configuration
	DescriptionLogBufferSize    = "how many log lines to show in the logs panel"
	DescriptionLogFileMaxSizeMB = "max size of the log file in MB"

	// Concurrency configuration
	DescriptionAssetFetchConcurrency      = "how many files to download at once (for chunks and source maps)"
	DescriptionAssetSaveConcurrency       = "how many files to save to disk at once"
	DescriptionBeautifierConcurrency      = "how many files to beautify at once"
	DescriptionChunkDiscovererConcurrency = "how many chunk discovery processes to run at once"
	DescriptionASTAnalyzerConcurrency     = "how many AST analysis processes to run at once"
	DescriptionOptimizerConcurrency       = "how many optimizer processes to run at once"
	DescriptionUnpackerConcurrency        = "how many unpacker processes to run at once"

	// Chunk discovery configuration
	DescriptionChunkDiscovererBruteForceLimit = "how many potential chunks to bruteforce when automatic discovery fails"

	// Memory configuration
	DescriptionMemoryLimitMB                    = "soft limit for the total memory in MB that jxscout and its subprocesses will use. if this limit is reached, jxscout will start throttling new subprocesses from being created"
	DescriptionMemoryUsageCheckInterval         = "interval at which to check memory usage"
	DescriptionBeautifierMemoryUsageLimitMB     = "max memory usage for each beautifier process in MB (0 = unlimited). if this limit is reached, the offending beautifier process will be killed"
	DescriptionChunkDiscovererMemoryUsageLimitMB = "max memory usage for each chunk discoverer process in MB (0 = unlimited). if this limit is reached, the offending chunk discoverer process will be killed"
	DescriptionASTAnalyzerMemoryUsageLimitMB    = "max memory usage for each AST analyzer process in MB (0 = unlimited). if this limit is reached, the offending AST analyzer process will be killed"
	DescriptionSourceMapDiscovererMemoryUsageLimitMB = "max memory usage for each source map discoverer process in MB (0 = unlimited). if this limit is reached, the offending source map discoverer process will be killed"
	DescriptionOptimizerMemoryUsageLimitMB      = "max memory usage for each optimizer process in MB (0 = unlimited). if this limit is reached, the offending optimizer process will be killed"
	DescriptionUnpackerMemoryUsageLimitMB       = "max memory usage for each unpacker process in MB (0 = unlimited). if this limit is reached, the offending unpacker process will be killed"
	DescriptionFilesystemIngestionFilesPerSecond = "number of files to ingest per second from the filesystem"

	// Feature toggles
	DescriptionEnableOptimizer = "enable the optimizer module"
	DescriptionEnableUnpacker  = "enable the unpacker module"

	// Chunk discovery
	DescriptionDiscoverGoogleLazyChunks = "enable discovery of Google lazy-loaded chunks (disabled by default)"

	// MCP Server configuration
	DescriptionMCPServerHostname = "hostname where the MCP server will listen for requests"
	DescriptionMCPServerPort     = "port where the MCP server will listen for requests"

	// Overrides configuration
	DescriptionCaidoHostname                = "hostname where Caido is running"
	DescriptionCaidoPort                    = "port where Caido is running"
	DescriptionOverrideContentCheckInterval = "interval at which to check for changes in override content and update match/replace rules"

	// Proxy rotation
	DescriptionProxyListFile         = "file containing list of proxy URLs (one per line)"
	DescriptionProxyRotationStrategy = "proxy rotation strategy: round-robin, random, least-used"
	DescriptionProxyMaxFailures      = "remove proxy after this many consecutive failures"

	// Per-host rate limiting
	DescriptionRateLimitConfigFile = "JSON file with per-host rate limits (e.g. {\"limits\": {\"example.com\": \"10/s\"}})"

	// Screenshots
	DescriptionEnableScreenshots     = "enable screenshot capture for HTML assets"
	DescriptionScreenshotConcurrency = "number of concurrent screenshot capture workers"
	DescriptionScreenshotTimeout     = "timeout for screenshot capture"
	DescriptionScreenshotViewport    = "screenshot viewport size (e.g. 1920x1080)"
)
