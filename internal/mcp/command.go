package mcp

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/francisconeves97/jxscout/pkg/constants"
	"github.com/spf13/cobra"
)

// RunMCPServer is exported for main binary integration
func RunMCPServer(cmd *cobra.Command, args []string) error {
	ctx := context.Background()

	hostname, _ := cmd.Flags().GetString("hostname")
	port, _ := cmd.Flags().GetInt("port")
	useHTTP, _ := cmd.Flags().GetBool("http")

	// Check environment variables
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
		token := os.Getenv("MCP_AUTH_TOKEN")
		if token == "" && !isLoopbackHost(hostname) {
			return fmt.Errorf("refusing to start MCP HTTP server on non-loopback %q without MCP_AUTH_TOKEN", hostname)
		}
		if token == "" {
			log.Printf("MCP auth disabled (loopback bind only)")
		}

		log.Printf("Starting MCP HTTP server on %s:%d", hostname, port)
		httpServer := NewHTTPServer(hostname, port, token)

		server := NewServer()
		httpServer.SetHandler(func(ctx context.Context, req *JSONRPCRequest) (interface{}, error) {
			return server.HandleRequest(ctx, req)
		})

		if err := httpServer.Start(); err != nil {
			return fmt.Errorf("MCP HTTP server error: %w", err)
		}
	} else {
		// Default stdio mode
		server := NewServer()
		if err := server.Run(ctx); err != nil {
			return fmt.Errorf("MCP server error: %w", err)
		}
	}

	return nil
}

func isLoopbackHost(hostname string) bool {
	if hostname == "localhost" {
		return true
	}
	ip := net.ParseIP(hostname)
	return ip != nil && ip.IsLoopback()
}

// NewMCPCommand creates the mcp subcommand
func NewMCPCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mcp",
		Short: "Start MCP (Model Context Protocol) server",
		Long:  "Start MCP server in stdio mode (default) or HTTP mode for AI assistant integration",
		RunE:  RunMCPServer,
	}

	cmd.Flags().String("hostname", constants.DefaultMCPServerHostname, "MCP server hostname")
	cmd.Flags().Int("port", constants.DefaultMCPServerPort, "MCP server port")
	cmd.Flags().Bool("http", false, "Enable HTTP mode instead of stdio")

	return cmd
}
