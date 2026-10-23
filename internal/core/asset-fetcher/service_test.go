package assetfetcher

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCheckFetchAddress(t *testing.T) {
	tests := []struct {
		addr    string
		blocked bool
	}{
		{"169.254.169.254:80", true}, // AWS/GCP metadata
		{"169.254.170.2:80", true},   // ECS task metadata
		{"[fe80::1]:443", true},      // IPv6 link-local
		{"[::]:443", true},           // unspecified
		{"127.0.0.1:8080", false},    // loopback is a normal scan target
		{"10.0.0.5:80", false},       // RFC1918
		{"192.168.1.10:443", false},  // RFC1918
		{"93.184.216.34:443", false}, // public
	}

	for _, tt := range tests {
		err := checkFetchAddress(tt.addr)
		if tt.blocked {
			assert.Error(t, err, tt.addr)
		} else {
			assert.NoError(t, err, tt.addr)
		}
	}
}
