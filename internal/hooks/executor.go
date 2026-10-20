package hooks

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
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
		// per-event concurrency overrides the global semaphore size via try-acquire style:
		// we use the global semaphore for the process name, but if the event config
		// sets a higher concurrency we rely on the global one (documented limitation);
		// simplest correct behavior: acquire from the process-name semaphore.
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

	ctx, cancel := context.WithTimeout(context.Background(), defaultHookTimeout)
	defer cancel()

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.CommandContext(ctx, "powershell", "-NoProfile", "-Command", script)
	} else {
		cmd = exec.CommandContext(ctx, "sh", "-c", script)
	}

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
