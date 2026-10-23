package mcp

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type HTTPServer struct {
	handler *MCPHandler
	server  *http.Server
	token   string
}

type MCPHandler struct {
	jsonrpcHandler func(context.Context, *JSONRPCRequest) (interface{}, error)
	token          string
}

// NewHTTPServer starts an MCP HTTP endpoint. An empty token disables auth,
// which is only acceptable on a loopback bind; any other bind refuses to
// start without MCP_AUTH_TOKEN (see command.go).
func NewHTTPServer(hostname string, port int, token string) *HTTPServer {
	handler := &MCPHandler{token: token}

	mux := http.NewServeMux()
	mux.HandleFunc("/", handler.handleRequest)

	return &HTTPServer{
		handler: handler,
		token:   token,
		server: &http.Server{
			Addr:    fmt.Sprintf("%s:%d", hostname, port),
			Handler: mux,
		},
	}
}

func (s *HTTPServer) SetHandler(fn func(context.Context, *JSONRPCRequest) (interface{}, error)) {
	s.handler.jsonrpcHandler = fn
}

func (s *HTTPServer) Start() error {
	return s.server.ListenAndServe()
}

func (s *HTTPServer) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

func (h *MCPHandler) handleRequest(w http.ResponseWriter, r *http.Request) {
	if h.token != "" {
		auth := r.Header.Get("Authorization")
		got := strings.TrimPrefix(auth, "Bearer ")
		if len(got) != len(h.token) ||
			subtle.ConstantTimeCompare([]byte(got), []byte(h.token)) != 1 {
			w.Header().Set("WWW-Authenticate", `Bearer realm="jxscout-mcp"`)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req JSONRPCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, nil, -32700, "Parse error", nil)
		return
	}

	// 2026-07-28 carries the version in MCP-Protocol-Version as well as _meta.
	headerVersion := r.Header.Get("MCP-Protocol-Version")
	req.TransportProtocolVersion = headerVersion

	// The spec requires 400 Bad Request for a malformed request; a version
	// mismatch is a recognized modern error and must keep its own code.
	if headerVersion != "" {
		if v := requestProtocolVersion(&req); v != "" && v != headerVersion {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      req.ID,
				Error: &RPCError{
					Code:    codeUnsupportedProtocolVersion,
					Message: "protocol version mismatch between header and _meta",
					Data:    map[string]interface{}{"header": headerVersion, "meta": v},
				},
			})
			return
		}
	}

	result, err := h.jsonrpcHandler(r.Context(), &req)
	if err != nil {
		code, data := rpcCode(err)
		w.Header().Set("Content-Type", "application/json")
		if code == codeUnsupportedProtocolVersion {
			w.WriteHeader(http.StatusBadRequest)
		}
		json.NewEncoder(w).Encode(JSONRPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
			Error:   &RPCError{Code: code, Message: err.Error(), Data: data},
		})
		return
	}

	h.sendResult(w, req.ID, result)
}

func (h *MCPHandler) sendResult(w http.ResponseWriter, id interface{}, result interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Result:  result,
	})
}

func (h *MCPHandler) sendError(w http.ResponseWriter, id interface{}, code int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Error:   &RPCError{Code: code, Message: message, Data: data},
	})
}
