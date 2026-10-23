package mcp

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func newTestHTTPServer(token string) *MCPHandler {
	handler := &MCPHandler{token: token}
	handler.jsonrpcHandler = func(context.Context, *JSONRPCRequest) (interface{}, error) {
		return map[string]string{"ok": "true"}, nil
	}
	return handler
}

func TestHTTPAuth(t *testing.T) {
	body := `{"jsonrpc":"2.0","id":1,"method":"initialize"}`

	t.Run("no token configured accepts requests", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		rec := httptest.NewRecorder()
		newTestHTTPServer("").handleRequest(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("missing token rejects", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		rec := httptest.NewRecorder()
		newTestHTTPServer("s3cret").handleRequest(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("wrong token rejects", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		req.Header.Set("Authorization", "Bearer wrong")
		rec := httptest.NewRecorder()
		newTestHTTPServer("s3cret").handleRequest(rec, req)
		assert.Equal(t, http.StatusUnauthorized, rec.Code)
	})

	t.Run("correct token accepts", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
		req.Header.Set("Authorization", "Bearer s3cret")
		rec := httptest.NewRecorder()
		newTestHTTPServer("s3cret").handleRequest(rec, req)
		assert.Equal(t, http.StatusOK, rec.Code)
	})
}

func TestIsLoopbackHost(t *testing.T) {
	assert.True(t, isLoopbackHost("localhost"))
	assert.True(t, isLoopbackHost("127.0.0.1"))
	assert.True(t, isLoopbackHost("::1"))
	assert.False(t, isLoopbackHost("0.0.0.0"))
	assert.False(t, isLoopbackHost("192.168.1.5"))
	assert.False(t, isLoopbackHost("example.com"))
}
