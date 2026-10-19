package main

import (
	"context"
	"log"

	"github.com/francisconeves97/jxscout/internal/mcp"
)

func main() {
	ctx := context.Background()

	server := mcp.NewServer()

	if err := server.Run(ctx); err != nil {
		log.Fatalf("MCP server error: %v", err)
	}
}
