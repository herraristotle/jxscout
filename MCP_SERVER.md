# JXScout MCP Server

Model Context Protocol (MCP) server for integrating JXScout with AI agents like Claude Desktop.

## Installation

1. Build the MCP server:
```bash
cd /path/to/jxscout
go build -o jxscout-mcp ./cmd/jxscout-mcp
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "jxscout": {
      "command": "/absolute/path/to/jxscout-mcp",
      "args": []
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
- `type` (string, optional): Wordlist type - `paths`, `secrets`, `params`, `packages` (default: `paths`)

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

## Protocol

Implements [Model Context Protocol](https://modelcontextprotocol.io) 2024-11-05 over stdio with JSON-RPC 2.0.

## Troubleshooting

- Ensure `jxscout-mcp` binary has execute permissions
- Use absolute paths in Claude Desktop config
- Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
