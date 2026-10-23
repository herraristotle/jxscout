package hooks

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

const defaultHookTimeout = 2 * time.Minute

type Executor struct {
	config *HookConfig
	logger *slog.Logger

	// per-process-name semaphores honoring process_configuration concurrency
	semaphores   map[string]chan struct{}
	semaphoresMu sync.Mutex
}

func NewExecutor(config *HookConfig, logger *slog.Logger) *Executor {
	semaphores := make(map[string]chan struct{})

	// semaphore per event+process pair; per-event concurrency overrides global
	for eventName, processes := range config.Events {
		for name, pc := range processes {
			concurrency := 1
			if pc.Concurrency != nil && *pc.Concurrency > 0 {
				concurrency = *pc.Concurrency
			} else if global, ok := config.ProcessConfiguration[name]; ok && global.Concurrency > 0 {
				concurrency = global.Concurrency
			}
			semaphores[semaphoreKey(eventName, name)] = make(chan struct{}, concurrency)
		}
	}

	return &Executor{
		config:     config,
		logger:     logger,
		semaphores: semaphores,
	}
}

func semaphoreKey(eventName, processName string) string {
	return eventName + "/" + processName
}

// Config returns the hooks configuration this executor was built from.
func (e *Executor) Config() *HookConfig {
	return e.config
}

// Execute runs every process subscribed to eventName with the given v2 payload.
// payload is marshaled to JSON and piped to the script's stdin.
func (e *Executor) Execute(eventName string, projectDir string, projectName string, payload any) {
	processes, ok := e.config.Events[eventName]
	if !ok {
		return
	}

	for processName, processConfig := range processes {
		go e.runProcess(processName, processConfig, eventName, projectDir, projectName, payload)
	}
}

func (e *Executor) runProcess(processName string, pc ProcessConfig, eventName, projectDir, projectName string, payload any) {
	key := semaphoreKey(eventName, processName)

	e.semaphoresMu.Lock()
	sem, ok := e.semaphores[key]
	if !ok {
		sem = make(chan struct{}, 1)
		e.semaphores[key] = sem
	}
	e.semaphoresMu.Unlock()

	sem <- struct{}{}
	defer func() { <-sem }()

	if err := e.execute(processName, pc, eventName, projectDir, projectName, payload); err != nil {
		e.logger.Error("hook process failed",
			"process", processName,
			"event", eventName,
			"error", err,
		)
	}
}

func (e *Executor) execute(processName string, pc ProcessConfig, eventName, projectDir, projectName string, payload any) error {
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	script := expandProjectDir(pc.Script, projectDir)

	// Parse script into command and arguments without shell interpretation
	cmdParts, err := parseScript(script)
	if err != nil {
		return fmt.Errorf("invalid script: %w", err)
	}

	// Validate command against allowlist (reject shell metacharacters)
	if err := validateCommand(cmdParts); err != nil {
		return fmt.Errorf("command validation failed: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), defaultHookTimeout)
	defer cancel()

	// Execute directly without shell
	cmd := exec.CommandContext(ctx, cmdParts[0], cmdParts[1:]...)

	cmd.Stdin = bytes.NewReader(payloadJSON)
	cmd.Dir = projectDir
	cmd.Env = append(os.Environ(),
		"JXSCOUT_PROJECT_DIR="+projectDir,
		"JXSCOUT_PROJECT_NAME="+projectName,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("script failed: %w, output: %s", err, truncate(string(output), 2000))
	}

	e.logger.Debug("hook process executed",
		"process", processName,
		"event", eventName,
		"output", truncate(string(output), 500),
	)

	return nil
}

// parseScript splits a script string into command and arguments,
// respecting quoted strings but NOT performing shell expansion.
func parseScript(script string) ([]string, error) {
	var parts []string
	var current strings.Builder
	inQuotes := false
	quoteChar := rune(0)
	escaped := false

	for _, r := range script {
		if escaped {
			current.WriteRune(r)
			escaped = false
			continue
		}

		if r == '\\' {
			escaped = true
			continue
		}

		if (r == '"' || r == '\'') && !inQuotes {
			inQuotes = true
			quoteChar = r
			continue
		}

		if r == quoteChar && inQuotes {
			inQuotes = false
			quoteChar = 0
			continue
		}

		if r == ' ' && !inQuotes {
			if current.Len() > 0 {
				parts = append(parts, current.String())
				current.Reset()
			}
			continue
		}

		current.WriteRune(r)
	}

	if current.Len() > 0 {
		parts = append(parts, current.String())
	}

	if len(parts) == 0 {
		return nil, fmt.Errorf("empty script")
	}

	return parts, nil
}

// validateCommand rejects commands containing shell metacharacters or dangerous patterns.
func validateCommand(parts []string) error {
	// Forbid shell metacharacters in any part
	for _, part := range parts {
		if strings.ContainsAny(part, ";|&$()`") {
			return fmt.Errorf("shell metacharacters not allowed: %s", part)
		}
		// Forbid command substitution patterns
		if strings.Contains(part, "$(") || strings.Contains(part, "`") {
			return fmt.Errorf("command substitution not allowed: %s", part)
		}
	}

	// Allowlist of safe commands (extend as needed)
	// By default, only allow executables in project dir or PATH
	cmd := parts[0]

	// Allow relative paths starting with ./ or ../ (project scripts)
	if strings.HasPrefix(cmd, "./") || strings.HasPrefix(cmd, "../") {
		return nil
	}

	// Allow absolute paths
	if strings.HasPrefix(cmd, "/") || (runtime.GOOS == "windows" && len(cmd) > 2 && cmd[1] == ':') {
		return nil
	}

	// Allow common safe commands by name
	allowedCommands := map[string]bool{
		"sh": true, "bash": true, "python3": true, "python": true,
		"node": true, "bun": true, "deno": true,
		"jq": true, "awk": true, "sed": true, "grep": true,
		"cat": true, "echo": true, "printf": true,
		"curl": true, "wget": true,
		"go": true, "gofmt": true,
	}
	if allowedCommands[strings.ToLower(filepath.Base(cmd))] {
		return nil
	}

	// For other commands, require explicit path (./ or /)
	return fmt.Errorf("command not in allowlist and not a relative/absolute path: %s", cmd)
}

// expandProjectDir replaces $JXSCOUT_PROJECT_DIR and ${JXSCOUT_PROJECT_DIR}
func expandProjectDir(script, projectDir string) string {
	replacer := strings.NewReplacer(
		"${JXSCOUT_PROJECT_DIR}", projectDir,
		"$JXSCOUT_PROJECT_DIR", projectDir,
	)
	return replacer.Replace(script)
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
