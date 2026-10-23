package assetfetcher

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"syscall"
	"time"

	"go.uber.org/ratelimit"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
)

// blockedFetchRanges are refused on connect. Link-local covers the cloud
// metadata endpoints (169.254.169.254, fe80::/10), the usual SSRF pivot.
// Loopback and RFC1918 stay reachable: scanning local/dev targets is the
// normal use of this tool.
var blockedFetchRanges = func() []*net.IPNet {
	cidrs := []string{"169.254.0.0/16", "fe80::/10", "::/128"}
	nets := make([]*net.IPNet, 0, len(cidrs))
	for _, c := range cidrs {
		_, n, err := net.ParseCIDR(c)
		if err != nil {
			panic(err)
		}
		nets = append(nets, n)
	}
	return nets
}()

func checkFetchAddress(address string) error {
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return errutil.Wrap(err, "invalid dial address")
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return nil // not an IP (unix socket etc.)
	}
	for _, n := range blockedFetchRanges {
		if n.Contains(ip) {
			return fmt.Errorf("refusing to fetch link-local address %s", ip)
		}
	}
	return nil
}

type AssetFetcher interface {
	RateLimitedGet(ctx context.Context, url string, headers map[string]string) (string, bool, error)
	Get(ctx context.Context, url string, headers map[string]string) (string, bool, error)
}

type assetFetcherImpl struct {
	client      *http.Client
	rateLimiter ratelimit.Limiter
}

type AssetFetcherOptions struct {
	RateLimitingMaxRequestsPerMinute int
	RateLimitingMaxRequestsPerSecond int
}

func NewAssetFetcher(options AssetFetcherOptions) *assetFetcherImpl {
	// Control runs on the resolved address right before connect, so it also
	// catches DNS names pointing at link-local.
	dialer := &net.Dialer{
		Control: func(network, address string, _ syscall.RawConn) error {
			return checkFetchAddress(address)
		},
	}

	c := &http.Client{
		Transport: &http.Transport{
			TLSHandshakeTimeout: 30 * time.Second,
			DisableKeepAlives:   false,
			DialContext:         dialer.DialContext,

			TLSClientConfig: &tls.Config{
				CipherSuites: []uint16{
					tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
					tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
					tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
					tls.TLS_AES_128_GCM_SHA256,
					tls.VersionTLS13,
					tls.VersionTLS10,
				},
				InsecureSkipVerify: true, // Disable certificate verification
			},
			DialTLSContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return (&tls.Dialer{
					NetDialer: dialer,
					Config:    &tls.Config{InsecureSkipVerify: true},
				}).DialContext(ctx, network, addr)
			},
		},
	}

	var rateLimiter ratelimit.Limiter

	if options.RateLimitingMaxRequestsPerMinute != 0 {
		rateLimiter = ratelimit.New(options.RateLimitingMaxRequestsPerMinute, ratelimit.Per(time.Minute))
	} else if options.RateLimitingMaxRequestsPerSecond != 0 {
		rateLimiter = ratelimit.New(options.RateLimitingMaxRequestsPerSecond, ratelimit.Per(time.Second))
	} else {
		rateLimiter = ratelimit.NewUnlimited()
	}

	return &assetFetcherImpl{
		client:      c,
		rateLimiter: rateLimiter,
	}
}

func (s *assetFetcherImpl) RateLimitedGet(ctx context.Context, url string, headers map[string]string) (string, bool, error) {
	s.rateLimiter.Take()

	return s.Get(ctx, url, headers)
}

// Get is a regular HTTP get but handles GZIP and adds headers to avoid being detected as bot.
func (s *assetFetcherImpl) Get(ctx context.Context, url string, headers map[string]string) (string, bool, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return "", false, errutil.Wrap(err, "failed to create request")
	}

	req.Header.Set("accept", "*/*")
	req.Header.Set("accept-language", "en-GB,en-US;q=0.9,en;q=0.8")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "script")
	req.Header.Set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	req.Header.Set("accept-encoding", "gzip")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", false, errutil.Wrap(err, "failed to perform request")
	}
	defer resp.Body.Close()

	// Read the entire response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", false, errutil.Wrap(err, "error reading response body")
	}

	// Check if the response is gzipped
	contentEncoding := resp.Header.Get("Content-Encoding")
	isGzipped := strings.Contains(contentEncoding, "gzip")

	// If not marked as gzipped, check for gzip magic number
	if !isGzipped {
		isGzipped = len(body) > 2 && body[0] == 0x1f && body[1] == 0x8b
	}

	// If gzipped, decompress
	if isGzipped {
		reader, err := gzip.NewReader(bytes.NewReader(body))
		if err != nil {
			return "", false, errutil.Wrap(err, "error creating gzip reader")
		}
		defer reader.Close()

		decompressed, err := io.ReadAll(reader)
		if err != nil {
			return "", false, errutil.Wrap(err, "error decompressing response body")
		}
		body = decompressed
	}

	return string(body), resp.StatusCode == http.StatusOK, nil
}
