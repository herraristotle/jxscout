package proxypool

import (
	"bufio"
	"errors"
	"net/url"
	"os"
	"sync"
	"time"
)

var (
	ErrNoProxiesAvailable = errors.New("no proxies available")
	ErrAllProxiesFailed   = errors.New("all proxies have failed")
)

type ProxyPool struct {
	proxies         []*ProxyEntry
	mu              sync.RWMutex
	currentIndex    int
	strategy        string
	maxFailures     int
	failureWindow   time.Duration
}

type ProxyEntry struct {
	URL              *url.URL
	Failures         int
	LastUsed         time.Time
	LastFailure      time.Time
	ConsecutiveFails int
}

// NewProxyPool creates a proxy pool from a file
func NewProxyPool(proxyFile string, strategy string, maxFailures int) (*ProxyPool, error) {
	if proxyFile == "" {
		return nil, nil // No proxy pool configured
	}

	file, err := os.Open(proxyFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var proxies []*ProxyEntry
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" || line[0] == '#' {
			continue
		}

		proxyURL, err := url.Parse(line)
		if err != nil {
			continue // Skip invalid URLs
		}

		proxies = append(proxies, &ProxyEntry{
			URL:      proxyURL,
			Failures: 0,
		})
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	if len(proxies) == 0 {
		return nil, ErrNoProxiesAvailable
	}

	if strategy == "" {
		strategy = "round-robin"
	}

	if maxFailures == 0 {
		maxFailures = 3
	}

	return &ProxyPool{
		proxies:       proxies,
		currentIndex:  0,
		strategy:      strategy,
		maxFailures:   maxFailures,
		failureWindow: 5 * time.Minute,
	}, nil
}

// GetNext returns the next proxy based on the rotation strategy
func (p *ProxyPool) GetNext() (*url.URL, error) {
	if p == nil {
		return nil, nil // No proxy pool configured
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	// Filter out failed proxies
	available := p.getAvailableProxies()
	if len(available) == 0 {
		return nil, ErrAllProxiesFailed
	}

	var selected *ProxyEntry

	switch p.strategy {
	case "round-robin":
		selected = available[p.currentIndex%len(available)]
		p.currentIndex++
	case "random":
		selected = available[time.Now().UnixNano()%int64(len(available))]
	case "least-used":
		selected = p.getLeastUsed(available)
	default:
		selected = available[0]
	}

	selected.LastUsed = time.Now()
	return selected.URL, nil
}

// MarkFailed marks a proxy as failed
func (p *ProxyPool) MarkFailed(proxyURL *url.URL) {
	if p == nil || proxyURL == nil {
		return
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	for _, entry := range p.proxies {
		if entry.URL.String() == proxyURL.String() {
			entry.Failures++
			entry.ConsecutiveFails++
			entry.LastFailure = time.Now()
			break
		}
	}
}

// MarkSuccess marks a proxy as successful
func (p *ProxyPool) MarkSuccess(proxyURL *url.URL) {
	if p == nil || proxyURL == nil {
		return
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	for _, entry := range p.proxies {
		if entry.URL.String() == proxyURL.String() {
			entry.ConsecutiveFails = 0
			break
		}
	}
}

func (p *ProxyPool) getAvailableProxies() []*ProxyEntry {
	now := time.Now()
	var available []*ProxyEntry

	for _, entry := range p.proxies {
		// Skip if exceeded max consecutive failures recently
		if entry.ConsecutiveFails >= p.maxFailures {
			// Allow retry after failure window
			if now.Sub(entry.LastFailure) < p.failureWindow {
				continue
			}
			// Reset after window expires
			entry.ConsecutiveFails = 0
		}
		available = append(available, entry)
	}

	return available
}

func (p *ProxyPool) getLeastUsed(proxies []*ProxyEntry) *ProxyEntry {
	if len(proxies) == 0 {
		return nil
	}

	least := proxies[0]
	for _, entry := range proxies[1:] {
		if entry.LastUsed.Before(least.LastUsed) {
			least = entry
		}
	}
	return least
}

// Stats returns proxy pool statistics
func (p *ProxyPool) Stats() map[string]interface{} {
	if p == nil {
		return nil
	}

	p.mu.RLock()
	defer p.mu.RUnlock()

	available := p.getAvailableProxies()
	totalFailures := 0
	for _, entry := range p.proxies {
		totalFailures += entry.Failures
	}

	return map[string]interface{}{
		"total":           len(p.proxies),
		"available":       len(available),
		"failed":          len(p.proxies) - len(available),
		"total_failures":  totalFailures,
		"strategy":        p.strategy,
	}
}
