package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/francisconeves97/jxscout/internal/mcp"
	"github.com/francisconeves97/jxscout/pkg/constants"
)

func main() {
	ctx := context.Background()

	// Check for --http flag or MCP_HTTP environment variable
	useHTTP := false
	hostname := constants.DefaultMCPServerHostname
	port := constants.DefaultMCPServerPort

	for i, arg := range os.Args {
		if arg == "--http" {
			useHTTP = true
		}
		if arg == "--hostname" && i+1 < len(os.Args) {
			hostname = os.Args[i+1]
		}
		if arg == "--port" && i+1 < len(os.Args) {
			fmt.Sscanf(os.Args[i+1], "%d", &port)
		}
	}
	if os.Getenv("MCP_HTTP") == "true" {
		useHTTP = true
	}
	if h := os.Getenv("MCP_HOSTNAME"); h != "" {
		hostname = h
	}
	if p := os.Getenv("MCP_PORT"); p != "" {
		fmt.Sscanf(p, "%d", &port)
	}

	if useHTTP {
		log.Printf("Starting MCP HTTP server on %s:%d", hostname, port)
		httpServer := mcp.NewHTTPServer(hostname, port)

		server := mcp.NewServer()
		httpServer.SetHandler(func(ctx context.Context, req *mcp.JSONRPCRequest) (interface{}, error) {
			return server.HandleRequest(ctx, req)
		})

		if err := httpServer.Start(); err != nil {
			log.Fatalf("MCP HTTP server error: %v", err)
		}
	} else {
		// Default stdio mode
		server := mcp.NewServer()
		if err := server.Run(ctx); err != nil {
			log.Fatalf("MCP server error: %v", err)
		}
	}
}
