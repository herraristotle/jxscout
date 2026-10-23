package mcp

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func requestWithVersion(t *testing.T, method, version string) *JSONRPCRequest {
	t.Helper()

	params := json.RawMessage(`{}`)
	if version != "" {
		params = json.RawMessage(`{"_meta":{"io.modelcontextprotocol/protocolVersion":"` + version + `"}}`)
	}
	return &JSONRPCRequest{JSONRPC: "2.0", ID: 1, Method: method, Params: params}
}

func TestDiscover(t *testing.T) {
	server := NewServer()

	res, err := server.HandleRequest(context.Background(), requestWithVersion(t, "server/discover", latestProtocolVersion))
	require.NoError(t, err)

	m := res.(map[string]interface{})
	assert.Equal(t, []string{"2026-07-28"}, m["supportedVersions"])
	assert.Equal(t, "complete", m["resultType"])
	assert.Contains(t, m["capabilities"], "tools")

	meta := m["_meta"].(map[string]interface{})
	assert.Equal(t, serverInfo, meta[metaServerInfo])
}

func TestUnsupportedProtocolVersion(t *testing.T) {
	server := NewServer()

	for _, version := range []string{"2024-11-05", "2025-06-18", "2025-11-25", "garbage"} {
		_, err := server.HandleRequest(context.Background(), requestWithVersion(t, "tools/list", version))
		require.Error(t, err, version)
		code, _ := rpcCode(err)
		assert.Equal(t, codeUnsupportedProtocolVersion, code, version)
	}
}

func TestLegacyInitializeIsGone(t *testing.T) {
	server := NewServer()

	_, err := server.HandleRequest(context.Background(), requestWithVersion(t, "initialize", ""))
	require.Error(t, err)
	code, _ := rpcCode(err)
	assert.Equal(t, -32601, code, "initialize must be unknown now")
}

func TestResultsCarryModernMetadata(t *testing.T) {
	server := NewServer()

	res, err := server.HandleRequest(context.Background(), requestWithVersion(t, "tools/list", latestProtocolVersion))
	require.NoError(t, err)

	m := res.(map[string]interface{})
	assert.Equal(t, "complete", m["resultType"])
	assert.Contains(t, m["_meta"].(map[string]interface{}), metaServerInfo)
}

func TestPing(t *testing.T) {
	server := NewServer()

	_, err := server.HandleRequest(context.Background(), requestWithVersion(t, "ping", latestProtocolVersion))
	require.NoError(t, err)
}

func TestHTTPHeaderVersionMismatch(t *testing.T) {
	req := &JSONRPCRequest{
		ID:                       1,
		Method:                   "tools/list",
		Params:                   json.RawMessage(`{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}`),
		TransportProtocolVersion: "2025-06-18",
	}
	assert.Equal(t, "2025-06-18", requestProtocolVersion(req), "header wins")
}
