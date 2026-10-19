package jxscout

import (
	"github.com/francisconeves97/jxscout/internal/core/common"
)

func (s *jxscout) startMemoryMonitoring() {
	if s.options.MemoryLimitMB > 0 {
		monitor := common.NewMemoryMonitor(
			s.options.MemoryLimitMB,
			s.options.MemoryUsageCheckInterval,
			s.log,
		)

		monitor.SetLimitExceededCallback(func() {
			alloc, sys := monitor.GetCurrentUsage()
			s.log.Error("critical memory limit exceeded after GC",
				"limit_mb", s.options.MemoryLimitMB,
				"alloc_mb", alloc,
				"sys_mb", sys,
			)
		})

		monitor.Start(s.ctx)
		s.log.Info("memory monitoring started",
			"limit_mb", s.options.MemoryLimitMB,
			"check_interval", s.options.MemoryUsageCheckInterval,
		)
	}
}
