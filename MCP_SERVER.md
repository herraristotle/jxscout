# JXScout MCP Server

Model Context Protocol (MCP) server for integrating JXScout with AI agents like Claude Desktop.

## Installation

1. Build jxscout (the `mcp` subcommand is part of the main binary):
```bash
cd /path/to/jxscout
go build -o jxscout ./cmd/jxscout
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "jxscout": {
      "command": "/absolute/path/to/jxscout",
      "args": ["mcp"]
    }
  }
}
```

3. Restart Claude Desktop

## Available Tools

### jxscout_list_projects
List all available JXScout projects.

**Parameters:** None

**Example:**
```json
{
  "name": "jxscout_list_projects",
  "arguments": {}
}
```

### jxscout_list_assets
List assets in a project.

**Parameters:**
- `project` (string, required): Project name
- `limit` (integer, optional): Max results (default 100)

**Example:**
```json
{
  "name": "jxscout_list_assets",
  "arguments": {
    "project": "my-app",
    "limit": 50
  }
}
```

### jxscout_get_asset
Get detailed information about a specific asset.

**Parameters:**
- `project` (string, required): Project name
- `url` (string, required): Asset URL

**Example:**
```json
{
  "name": "jxscout_get_asset",
  "arguments": {
    "project": "my-app",
    "url": "https://example.com/app.js"
  }
}
```

### jxscout_get_descriptors
Get AST analysis descriptors for an asset (secrets, endpoints, parameters, etc.).

**Parameters:**
- `project` (string, required): Project name
- `url` (string, required): Asset URL

**Example:**
```json
{
  "name": "jxscout_get_descriptors",
  "arguments": {
    "project": "my-app",
    "url": "https://example.com/app.js"
  }
}
```

### jxscout_generate_wordlist
Generate wordlists for fuzzing/testing.

**Parameters:**
- `project` (string, required): Project name
- `type` (string, optional): Wordlist type - `paths`, `secrets`, `params`, `packages` (default: `paths`).
  `secrets` reads the `secrets` analyzer, `params` the `url-search-params`
  analyzer, `packages` the `dependency-confusion` analyzer. Results are sorted.

**Example:**
```json
{
  "name": "jxscout_generate_wordlist",
  "arguments": {
    "project": "my-app",
    "type": "params"
  }
}
```

## Use Cases with Claude

1. **Security Analysis**
   - "Show me all secrets found in the 'production-app' project"
   - "What GraphQL endpoints are exposed in this JavaScript bundle?"
   - "Generate a parameter wordlist for fuzzing"

2. **Code Intelligence**
   - "List all assets that use localStorage"
   - "Find all postMessage calls and their target origins"
   - "Show me dependency confusion risks (npm packages)"

3. **Vulnerability Research**
   - "Extract all API endpoints and their HTTP methods"
   - "Find DOM XSS sinks (innerHTML, eval, etc.)"
   - "List all event listeners and their handlers"

## Resources and Prompts

### Resources

`resources/list` enumerates projects. `resources/read` returns asset content:

```json
{"jsonrpc":"2.0","id":3,"method":"resources/read",
 "params":{"uri":"jxscout://<project>/<path under assets/>"}}
```

The path is symlink-resolved and must stay inside the project's `assets/`
directory. Escapes are rejected.

### Prompts

`prompts/list` exposes `triage-asset`, which takes `project` and `url` and returns
a message telling the model to pull descriptors, pull the asset, group by
analyzer, and rank candidates.

## Protocol

Implements [Model Context Protocol](https://modelcontextprotocol.io) **2026-07-28** over stdio with JSON-RPC 2.0.

This is the modern, stateless revision:

- every request carries its version in `_meta["io.modelcontextprotocol/protocolVersion"]`
  (and, on HTTP, the `MCP-Protocol-Version` header);
- `server/discover` returns `supportedVersions`, `capabilities` and identity;
- every result carries `resultType` and `_meta["io.modelcontextprotocol/serverInfo"]`;
- an unsupported version answers with `UnsupportedProtocolVersionError` (`-32022`)
  listing the supported versions, and HTTP returns `400 Bad Request`.

There is no `initialize` handshake and no session state; those were removed in
this revision. The only supported version is `2026-07-28`.

HTTP mode (`jxscout mcp --http`) binds loopback with no auth by default. Set
`MCP_AUTH_TOKEN` to require `Authorization: Bearer <token>`; the server refuses
to start on a non-loopback host without it.

## Troubleshooting

- Ensure the `jxscout` binary has execute permissions
- Use absolute paths in Claude Desktop config
- Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
