# Changelog

All notable changes to JXScout will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pro v2 hook system (strictly v2, no v1 compatibility): 9 events
  (`js_file_saved`, `js_file_updated`, `js_file_beautified`, `html_file_saved`,
  `html_file_updated`, `html_file_beautified`, `reversed_source_map_file_saved`,
  `matches_created`, `finding_created`) configured in `settings.jsonc` under
  `hooks` as `event -> process -> {script, concurrency}`; scripts receive
  event-specific JSON payloads on stdin with `$JXSCOUT_PROJECT_DIR` expansion
- Structured findings feature (Pro v2): `findings` table, REST API
  (`POST/GET /findings`), CLI commands `create-finding` and `list-findings`
  with severity/kind filtering and `kind`+`dedup-key` deduplication; creates
  publish the `finding_created` hook event
- Auto-creation of project `settings.jsonc` (with documented v2 hooks template),
  `settings.schema.json`, and global settings on first run — new systems need
  no manual config file setup
- Headless mode: without a TTY the proxy runs in background and blocks on
  SIGTERM/SIGINT with graceful shutdown (previously exited immediately)

### Changed
- Default server port moved to 3333 (avoid Windows host port 8080 conflicts)
- Hooks module subscribes via the durable DB event bus (in-memory subscription
  never received asset/beautifier/analysis events)
- Asset content updates propagate an `updated` flag through
  asset-saved → beautifier → analyzer, firing `*_updated` events and forcing
  match re-analysis

## [1.0.0-oss] - 2026-10-19

### Added
- Bookmarks module with full CRUD operations and REST API (`/api/bookmarks`)
- Custom analyzers framework supporting regex, script, and derived analyzer types
- Memory monitoring and enforcement system with configurable limits
- Project backup command with streaming tar.gz support for large projects
- CLI tools binary (`jxscout-cli`) with four commands:
  - `wordlist` - Extract paths, secrets, params, or packages
  - `query` - Export assets, descriptors, or findings as JSON
  - `fs-ingest` - Ingest local JavaScript files into project database
  - `backup` - Create compressed project backups
- MCP (Model Context Protocol) server with both stdio and HTTP modes
- Webpack/Vite retry plugin generator for handling chunk load failures
- Optimizer module with dead code elimination and constant folding
- Unpacker module with multiple deobfuscation strategies:
  - Dean Edwards packer detection and unpacking
  - Webpack module extraction and formatting
  - String array deobfuscation
  - Control flow flattening reversal using Babel transforms
- Dependency confusion AST analyzer for supply chain attack detection
- 17 new configuration flags for Pro feature control
- Per-module memory limiters with GC throttling
- Database schema extensions: `is_optimized`, `optimized_from`, `is_unpacked`, `unpacked_from`, `screenshot_path` columns
- **Proxy rotation system** - Round-robin/random/least-used strategies with automatic failure detection
- **Per-host rate limiting** - Domain-specific rate limits with wildcard pattern matching
- **Screenshot capture module** - Automated HTML page screenshots via headless Chrome/Chromium
- **Report generation** - Export findings as PDF/HTML/JSON with customizable templates
- **Diff mode** - Compare two project snapshots to identify added/removed/modified assets
- **Project comparison** - Multi-project statistics and asset overlap analysis

### Fixed
- [#31](https://github.com/francisconeves97/jxscout/issues/31) - Authentication headers now propagate through entire pipeline (chunks, sourcemaps)
- [#13](https://github.com/francisconeves97/jxscout/issues/13) - Sourcemaps download with proper auth headers and 4 fallback strategies
- [#9](https://github.com/francisconeves97/jxscout/issues/9) - Scope validation logging in DEBUG mode for rejected requests
- [#8](https://github.com/francisconeves97/jxscout/issues/8) - File-based scope loading via `--scope` flag
- [#16](https://github.com/francisconeves97/jxscout/issues/16) - Enhanced AST analyzers with 25 total detection rules
- GraphQL analyzer string escape decoding for embedded queries
- Secrets analyzer noise reduction to skip React internal code
- WebSocket upgrade compatibility (CheckOrigin, Subprotocols support)
- Sourcemap collision handling with hash-based isolation
- Chunk deduplication via database fingerprint checking
- Next.js, Turbopack, and Google lazy chunk fingerprint detection

### Changed
- Version bump from 0.9.5 to 1.0.0-oss
- Removed commercial Pro marketing disclaimers from TUI and README
- Kept security disclaimer in README for responsible use
- Database path standardization: CLI and MCP now use `db/db.sql` consistently
- Table name corrections: `ast_analysis_results` instead of `ast_analysis`
- Improved NULL handling in database queries with proper pointer types

### Security
- Added dependency confusion detection to identify potential supply chain attacks
- Enhanced secrets detection with better pattern matching
- Authentication header preservation across all module boundaries

## [0.9.5] - 2024

### Added
- Project-level configuration support (#28)
- Hostname field in reversed sourcemaps (#29)
- Check for existing bun and prettier before installing (#32)

### Fixed
- Migration check improvements
- Beautification on-demand functionality

## Earlier Versions

See [git history](https://github.com/francisconeves97/jxscout/commits/main) for versions prior to 0.9.5.

---

## Release Notes

### 1.0.0-oss Feature Summary

This release represents a complete modernization of JXScout with **17 major Pro features** implemented:

1. **Bookmarks** - Save and organize interesting findings
2. **Custom Analyzers** - Extend AST analysis with your own rules
3. **Memory Limits** - Prevent OOM with configurable memory monitoring
4. **Project Backup** - Archive entire projects including large asset collections
5. **CLI Tools** - Command-line utilities for automation and scripting
6. **MCP Integration** - Model Context Protocol server for AI assistant integration
7. **Retry Plugins** - Generate Webpack/Vite plugins for resilient chunk loading
8. **Optimizer** - Minify and optimize discovered JavaScript
9. **Unpacker** - Deobfuscate packed/obfuscated code automatically
10. **Wordlist Generation** - Extract wordlists for penetration testing
11. **Advanced Ingestion** - Local filesystem ingestion and batch processing
12. **Proxy Rotation** - Distribute requests across proxy pools to avoid rate limits
13. **Per-Host Rate Limiting** - Fine-grained rate control per target domain
14. **Screenshot Capture** - Visual verification of HTML pages
15. **Report Generation** - Professional PDF/HTML/JSON reports for stakeholders
16. **Diff Mode** - Track changes between project versions
17. **Project Comparison** - Compare multiple projects side-by-side

All implementations follow clean-room development practices and maintain GPL-3.0 compliance.

For detailed upgrade information, see [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md).
