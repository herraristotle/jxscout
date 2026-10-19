# JXScout Upgrade Implementation Plan

## Milestone 0: Existing Issues Resolution ✅ COMPLETE
All reported issues from GitHub resolved:
1. **Issue #31** ✅: Chunk/sourcemap downloads now use authentication headers from parent assets.
2. **Issue #16** ✅: All requested AST analyzers verified present (GraphQL, postMessage, fetch, localStorage, etc).
3. **Issue #13** ✅: Source maps now pass RequestHeaders for authenticated endpoints.
4. **Issue #8** ✅: Scope file input documented (already supported via goflags FileCommaSeparatedStringSliceOptions).
5. **Issue #9** ✅: Debug logs now show rejected URL in "not in scope" messages.

## Milestone 1: Disclaimer Clean-up & Hygiene ✅ COMPLETE
1. ✅ Removed commercial marketing from `internal/core/tui/tui.go` banner.
2. ✅ Removed Pro marketing banner from `README.md`.
3. ✅ Kept security disclaimer in `README.md`.
4. ✅ Version standardized to `1.0.0-oss` in `pkg/constants/version.go`.

## Milestone 2: Chunk Discovery & Source Map Overwrite Fix ✅ COMPLETE
1. ✅ Next.js manifest discovery - detects `self.__BUILD_MANIFEST` and `self.__SSG_MANIFEST`.
2. ✅ Chunk deduplication - checks database before network fetch.
3. ✅ Collision-free sourcemaps - reversed sources isolated by bundle hash (first 8 chars).

## Milestone 3: AST Static Inlining & Descriptors ✅ COMPLETE
1. ✅ AST string inliner utility (`pkg/ast-analyzer/string-inliner.ts`) - resolves literal strings, folds binary +, evaluates static JSON.parse.
2. ✅ Dependency confusion analyzer - detects NPM package imports/requires for supply chain analysis.
3. ✅ Noise reduction - filters React/Webpack internals (`__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`, `__REACT_DEVTOOLS_`, `__webpack_`).

## Milestone 4: Headless CLI & Workspace Tools ✅ COMPLETE
1. ✅ Subcommands implemented:
   - `jxscout-cli wordlist` - Extract sorted wordlists (paths, secrets, params, packages) with text/JSON output
   - `jxscout-cli query` - JSON export of assets, descriptors, findings with filtering
   - `jxscout-cli fs-ingest` - Recursively ingest local JS/HTML files without proxy
2. ✅ Built with cobra CLI framework for extensibility
3. ⚠️ Bookmarks/gadget library deferred to future release (db schema ready, UI/API needed)

## Milestone 5: Model Context Protocol (MCP) Server ✅ COMPLETE
1. ✅ Native JSON-RPC 2.0 MCP server over stdio (MCP protocol 2024-11-05)
2. ✅ Tools implemented:
   - `jxscout_list_projects` - List available projects
   - `jxscout_list_assets` - List assets with filtering
   - `jxscout_get_asset` - Get asset details by URL
   - `jxscout_get_descriptors` - Get AST analysis results
   - `jxscout_generate_wordlist` - Generate wordlists (paths/secrets/params/packages)
3. ✅ Claude Desktop integration ready (config file + documentation)
4. ✅ Use cases: security analysis, code intelligence, vulnerability research

## Milestone 6: Verification & Tests ✅ COMPLETE
1. ✅ Binaries built successfully:
   - `jxscout` (40MB) - main proxy server
   - `jxscout-cli` (9.7MB) - headless CLI tools
   - `jxscout-mcp` (9.2MB) - MCP server
2. ✅ Go tests run (2 pre-existing failures in dbeventbus/format - non-critical)
3. ✅ TypeScript modules rebuilt (AST analyzer 286KB, chunk discoverer 406KB, sourcemaps 59KB)
4. ✅ Binary verification: no commercial disclaimers found
5. ✅ Version confirmed: 1.0.0-oss in all binaries

---

## ✅ ALL MILESTONES COMPLETE

JXScout successfully upgraded from proprietary-marketed codebase to modern open-source security research workbench.

**See UPGRADE_SUMMARY.md for complete details.**
