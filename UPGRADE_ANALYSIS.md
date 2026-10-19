# JXScout Technical Upgrade Analysis

## 1. System Inventory & Runtime Architecture
- **Language**: Go 1.23.2 + TypeScript / JavaScript (Node.js & Bun).
- **Core Orchestrator**: Go runtime (`cmd/jxscout/main.go`, `pkg/jxscout/jxscout.go`).
- **HTTP / WebSockets**: `go-chi/chi/v5` router, Gorilla WebSocket, standard library `net/http`.
- **Database & Queue**: SQLite 3 (`mattn/go-sqlite3`, `jmoiron/sqlx`) in WAL mode (`internal/core/database/database.go`); transactional task polling (`internal/core/dbeventbus/eventbus.go`).
- **Terminal UI**: Charmbracelet `bubbletea`, `lipgloss`, `bubbles`, `reflow`.
- **Static Analysis & Bundling**:
  - `oxc-parser` v0.68.0 with precompiled platform NAPI binaries (`linux-x64-gnu`, `linux-x64-musl`, `linux-arm64-gnu`, `darwin-x64`, `darwin-arm64`, `win32-x64-msvc`).
  - `estree-toolkit` + `acorn` + `sval` for chunk loader interpretation.
  - Mozilla `source-map` v0.7.4 with WebAssembly mapping decoder.
  - `prettier` v3.5.3 CLI for code beautification.
- **Build System**: `Makefile` + Rsbuild (`@rsbuild/core`). Bundles TS modules (`astAnalyzer.js`, `chunkDiscoverer.js`, `sourceMaps.js`) into Go embedded binaries (`//go:embed`).

## 2. Component Architecture Map

```
  [ Security Proxy: Caido / Burp ]
                 │
           (HTTP POST /ingest)
                 ▼
     [ Ingestion Module (Go) ] ────► [ InMemoryEventBus ]
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
             [ HTML Ingestion Module ]                 [ JS Ingestion Module ]
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              ▼
                                   [ AssetService (Go) ]
                             (Saves to disk + SQLite DB)
                                              │
                                              ▼ (DBEventBus)
               ┌──────────────────────────────┼──────────────────────────────┐
               ▼                              ▼                              ▼
     [ Beautifier Module ]         [ Chunk Discoverer ]            [ SourceMaps Module ]
     (Prettier CLI Babel)       (Webpack / Vite / Next.js)         (Extract & Reverse)
               │                              │                              │
               ▼ (Beautified)                 ▼ (Fetch chunks)               ▼ (Reversed JS)
     [ AST Analyzer Module ]        [ AssetFetcher (Go) ]          [ AST Analyzer Module ]
     (oxc-parser + TS Rules)                  │
               │                              ▼
               └───────────────────► [ SQLite Analysis Tables ]
                                              │
                                              ▼
                                 [ WebSocket & TUI Interfaces ]
```

## 3. License Analysis & GPL-3.0 Obligations
- **Base License**: GNU General Public License v3.0 (`COPYING`).
- **Permissions**: Freedom to inspect, modify, run, and distribute modified binaries and sources.
- **Obligations**:
  - Modified source code must be distributed under GPL-3.0.
  - Prominent notices must indicate modifications (GPL-3.0 Section 5a).
  - GPL-3.0 warranty disclaimers (`COPYING` Sections 15–16) must remain intact.
- **Third-Party Compatibility**:
  - Go dependencies (MIT/BSD-3-Clause/Apache-2.0) are GPL-3.0 compatible.
  - JS dependencies (`oxc-parser` MIT, `source-map` BSD-3-Clause, `acorn` MIT, `prettier` MIT) are GPL-3.0 compatible.
- **Clean-Room Verification**: No proprietary assets, license checks, or closed-source code from JXScout Pro are used. Upgrades are clean-room implementations using standard open specifications.

## 4. Disclaimer Locations Audit
Matches confirmed:
1. `internal/core/tui/tui.go` (line 326): Commercial disclaimer claiming software is unmaintained and advertising JXScout Pro.
2. `README.md` (lines 1–10): Markdown block advertising JXScout Pro.
3. `README.md` (lines 262–270): Security authorized testing notice. Kept for responsible-use compliance.
4. `COPYING` (lines 15–16): GPL warranty disclaimer. Kept for legal compliance.

## 5. Feature Gap Matrix (OSS vs Advertised Pro)

| Capability | Current OSS (v0.9.5) | Pro Advertised | Upgraded OSS Plan |
|---|---|---|---|
| **Chunk Discovery** | Webpack (`Loading chunk`), Vite (`__vite__mapDeps`) | Webpack, Vite, Next.js (`_buildManifest.js`), Turbopack, static imports | Add Next.js manifest chunk parser, static import matcher, and duplicate DB pre-check |
| **Source Maps** | Flat extraction to `sourcemaps/reversed/<host>/...` | Namespace isolation preventing file collisions | Isolate reversed files per asset/map ID, preventing file collisions |
| **JS Optimization** | None (Prettier only) | Constant inlining, string concat resolution, JSON.parse evaluation | Add AST-based constant folding & string concat inliner pass |
| **Descriptors** | 24 AST rules | Extended descriptors, Dependency confusion, React internals filter | Add Dependency Confusion analyzer, React internal exclusions |
| **CLI & Workflows** | Interactive TUI only | Headless CLI, fs-ingest, wordlist generator | Add CLI subcommands: `server`, `fs-ingest`, `wordlist`, `query` |
| **AI Integration** | None (WebSocket only) | MCP Server | Built-in stdio JSON-RPC Model Context Protocol (MCP) server |
| **Bookmarks** | None | Bookmark library for gadgets & data flows | Add SQLite bookmarks table & CLI/MCP query tools |
| **Telemetry** | None | Telemetry-free | Completely local, zero telemetry |

## 6. Features Excluded
- Proprietary licensing/telemetry code (anti-feature).
- Binary-only obfuscation/deobfuscation (security risk).
- Automated live exploit generation (dual-use restriction).
