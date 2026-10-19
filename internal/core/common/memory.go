package common

import (
	"context"
	"fmt"
	"log/slog"
	"runtime"
	"time"
)

type MemoryMonitor struct {
	limitMB           int
	checkInterval     time.Duration
	logger            *slog.Logger
	cancelFunc        context.CancelFunc
	onLimitExceeded   func()
}

func NewMemoryMonitor(limitMB int, checkInterval time.Duration, logger *slog.Logger) *MemoryMonitor {
	return &MemoryMonitor{
		limitMB:       limitMB,
		checkInterval: checkInterval,
		logger:        logger,
	}
}

func (m *MemoryMonitor) Start(ctx context.Context) {
	ctx, cancel := context.WithCancel(ctx)
	m.cancelFunc = cancel

	go m.monitor(ctx)
}

func (m *MemoryMonitor) Stop() {
	if m.cancelFunc != nil {
		m.cancelFunc()
	}
}

func (m *MemoryMonitor) SetLimitExceededCallback(fn func()) {
	m.onLimitExceeded = fn
}

func (m *MemoryMonitor) monitor(ctx context.Context) {
	ticker := time.NewTicker(m.checkInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			var mem runtime.MemStats
			runtime.ReadMemStats(&mem)

			allocMB := mem.Alloc / 1024 / 1024
			sysMB := mem.Sys / 1024 / 1024

			if int(allocMB) > m.limitMB {
				m.logger.Warn("memory limit exceeded",
					"limit_mb", m.limitMB,
					"alloc_mb", allocMB,
					"sys_mb", sysMB,
					"num_gc", mem.NumGC,
				)

				// Force GC
				runtime.GC()

				// Re-check after GC
				runtime.ReadMemStats(&mem)
				allocAfterGC := mem.Alloc / 1024 / 1024

				m.logger.Info("forced garbage collection",
					"alloc_before_mb", allocMB,
					"alloc_after_mb", allocAfterGC,
					"freed_mb", allocMB-allocAfterGC,
				)

				if int(allocAfterGC) > m.limitMB && m.onLimitExceeded != nil {
					m.onLimitExceeded()
				}
			}
		}
	}
}

func (m *MemoryMonitor) GetCurrentUsage() (allocMB, sysMB uint64) {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	return mem.Alloc / 1024 / 1024, mem.Sys / 1024 / 1024
}

type ModuleMemoryLimiter struct {
	limitMB       int
	moduleName    string
	logger        *slog.Logger
	lastCheck     time.Time
	checkInterval time.Duration
}

func NewModuleMemoryLimiter(moduleName string, limitMB int, logger *slog.Logger) *ModuleMemoryLimiter {
	return &ModuleMemoryLimiter{
		limitMB:       limitMB,
		moduleName:    moduleName,
		logger:        logger,
		checkInterval: 5 * time.Second,
	}
}

func (m *ModuleMemoryLimiter) CheckAndThrottle() error {
	now := time.Now()
	if now.Sub(m.lastCheck) < m.checkInterval {
		return nil
	}
	m.lastCheck = now

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	allocMB := mem.Alloc / 1024 / 1024

	if int(allocMB) > m.limitMB {
		m.logger.Warn(fmt.Sprintf("%s module: memory limit exceeded, throttling", m.moduleName),
			"limit_mb", m.limitMB,
			"current_mb", allocMB,
		)

		// Sleep briefly to throttle processing
		time.Sleep(1 * time.Second)

		// Force GC
		runtime.GC()

		return fmt.Errorf("memory limit exceeded: %d MB (limit: %d MB)", allocMB, m.limitMB)
	}

	return nil
}
