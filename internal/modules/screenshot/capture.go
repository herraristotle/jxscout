package screenshot

import (
	"context"
	"fmt"
	"log/slog"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
)

type Capturer struct {
	timeout  time.Duration
	viewport string
	width    int
	height   int
	logger   *slog.Logger
}

func NewCapturer(timeout time.Duration, viewport string, logger *slog.Logger) (*Capturer, error) {
	width, height := 1920, 1080
	if viewport != "" {
		parts := strings.Split(viewport, "x")
		if len(parts) == 2 {
			if w, err := strconv.Atoi(parts[0]); err == nil {
				width = w
			}
			if h, err := strconv.Atoi(parts[1]); err == nil {
				height = h
			}
		}
	}

	// Check if chromium or chrome is available
	if !isChromiumAvailable() {
		return nil, fmt.Errorf("chromium/chrome not found - install chromium-browser or google-chrome")
	}

	return &Capturer{
		timeout:  timeout,
		viewport: viewport,
		width:    width,
		height:   height,
		logger:   logger,
	}, nil
}

func (c *Capturer) Capture(ctx context.Context, url string, outputPath string) error {
	ctx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	// Use headless Chrome/Chromium via command line
	// Simpler than chromedp and works without additional dependencies
	chromePath := getChromePath()
	if chromePath == "" {
		return fmt.Errorf("no chromium/chrome binary found")
	}

	args := []string{
		"--headless",
		"--disable-gpu",
		"--no-sandbox",
		"--disable-dev-shm-usage",
		"--disable-software-rasterizer",
		fmt.Sprintf("--window-size=%d,%d", c.width, c.height),
		fmt.Sprintf("--screenshot=%s", outputPath),
		url,
	}

	cmd := exec.CommandContext(ctx, chromePath, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return errutil.Wrap(err, fmt.Sprintf("chromium failed: %s", string(output)))
	}

	return nil
}

func (c *Capturer) Close() error {
	// Headless CLI approach doesn't need cleanup
	return nil
}

func isChromiumAvailable() bool {
	return getChromePath() != ""
}

func getChromePath() string {
	// Try common chrome/chromium binary locations
	candidates := []string{
		"chromium-browser",
		"chromium",
		"google-chrome",
		"chrome",
		"/usr/bin/chromium-browser",
		"/usr/bin/chromium",
		"/usr/bin/google-chrome",
		"/snap/bin/chromium",
	}

	for _, binary := range candidates {
		if path, err := exec.LookPath(binary); err == nil {
			return path
		}
	}

	return ""
}
