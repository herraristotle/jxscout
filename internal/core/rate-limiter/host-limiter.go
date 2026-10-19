package ratelimiter

import (
	"context"
	"encoding/json"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"

	"golang.org/x/time/rate"
)

type HostRateLimiter struct {
	limiters    map[string]*rate.Limiter
	mu          sync.RWMutex
	defaultRate rate.Limit
	hostRates   map[string]rate.Limit
}

type RateLimitConfig struct {
	Limits map[string]string `json:"limits"`
}

// NewHostRateLimiter creates a per-host rate limiter
func NewHostRateLimiter(configFile string, defaultPerSecond int) (*HostRateLimiter, error) {
	rl := &HostRateLimiter{
		limiters:    make(map[string]*rate.Limiter),
		hostRates:   make(map[string]rate.Limit),
		defaultRate: rate.Limit(defaultPerSecond),
	}

	if configFile != "" {
		if err := rl.loadConfig(configFile); err != nil {
			return nil, err
		}
	}

	return rl, nil
}

func (rl *HostRateLimiter) loadConfig(configFile string) error {
	data, err := os.ReadFile(configFile)
	if err != nil {
		return err
	}

	var config RateLimitConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return err
	}

	for host, rateStr := range config.Limits {
		rateLimit, err := parseRateLimit(rateStr)
		if err != nil {
			continue // Skip invalid rates
		}
		rl.hostRates[host] = rateLimit
	}

	return nil
}

// Wait blocks until request is allowed for the given URL's host
func (rl *HostRateLimiter) Wait(ctx context.Context, targetURL string) error {
	u, err := url.Parse(targetURL)
	if err != nil {
		return err
	}

	host := u.Hostname()
	limiter := rl.getLimiter(host)
	return limiter.Wait(ctx)
}

// Allow checks if a request is allowed for the given URL's host
func (rl *HostRateLimiter) Allow(targetURL string) bool {
	u, err := url.Parse(targetURL)
	if err != nil {
		return true // Allow if URL is invalid
	}

	host := u.Hostname()
	limiter := rl.getLimiter(host)
	return limiter.Allow()
}

func (rl *HostRateLimiter) getLimiter(host string) *rate.Limiter {
	rl.mu.RLock()
	limiter, exists := rl.limiters[host]
	rl.mu.RUnlock()

	if exists {
		return limiter
	}

	// Create new limiter for this host
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Double-check after acquiring write lock
	if limiter, exists := rl.limiters[host]; exists {
		return limiter
	}

	// Check for host-specific rate or wildcard match
	rateLimit := rl.defaultRate
	if hostRate, ok := rl.hostRates[host]; ok {
		rateLimit = hostRate
	} else {
		// Check wildcard patterns (*.example.com)
		for pattern, patternRate := range rl.hostRates {
			if matchWildcard(pattern, host) {
				rateLimit = patternRate
				break
			}
		}
	}

	limiter = rate.NewLimiter(rateLimit, int(rateLimit)+10) // Burst = rate + 10
	rl.limiters[host] = limiter
	return limiter
}

// parseRateLimit converts "10/s" or "100/m" to rate.Limit
func parseRateLimit(rateStr string) (rate.Limit, error) {
	parts := strings.Split(rateStr, "/")
	if len(parts) != 2 {
		return 0, nil
	}

	count, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, err
	}

	var perSecond float64
	switch parts[1] {
	case "s":
		perSecond = float64(count)
	case "m":
		perSecond = float64(count) / 60.0
	case "h":
		perSecond = float64(count) / 3600.0
	default:
		perSecond = float64(count)
	}

	return rate.Limit(perSecond), nil
}

// matchWildcard checks if host matches wildcard pattern
// Pattern: *.example.com matches api.example.com, cdn.example.com
func matchWildcard(pattern, host string) bool {
	if !strings.HasPrefix(pattern, "*.") {
		return false
	}

	suffix := pattern[2:] // Remove "*."
	return strings.HasSuffix(host, "."+suffix) || host == suffix
}

// Stats returns rate limiter statistics
func (rl *HostRateLimiter) Stats() map[string]interface{} {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	hostStats := make(map[string]interface{})
	for host, limiter := range rl.limiters {
		hostStats[host] = map[string]interface{}{
			"limit": limiter.Limit(),
			"burst": limiter.Burst(),
		}
	}

	return map[string]interface{}{
		"tracked_hosts": len(rl.limiters),
		"hosts":         hostStats,
	}
}
