package mcp

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type HTTPServer struct {
	handler *MCPHandler
	server  *http.Server
}

type MCPHandler struct {
	jsonrpcHandler func(context.Context, *JSONRPCRequest) (interface{}, error)
}

func NewHTTPServer(hostname string, port int) *HTTPServer {
	handler := &MCPHandler{}
	
	mux := http.NewServeMux()
	mux.HandleFunc("/", handler.handleRequest)
	
	return &HTTPServer{
		handler: handler,
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
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req JSONRPCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, nil, -32700, "Parse error", nil)
		return
	}

	result, err := h.jsonrpcHandler(r.Context(), &req)
	if err != nil {
		h.sendError(w, req.ID, -32603, err.Error(), nil)
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
