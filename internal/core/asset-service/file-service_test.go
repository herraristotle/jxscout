package assetservice

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCleanWindows(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"app.js", "app.js"},
		{"chunk(1).js", "chunk(1).js"},       // parens are legal on NTFS
		{"a?b*c|d.js", "abcd.js"},
		{`a<b>c:d"e.js`, "abcde.js"},
		{"(index).html", "(index).html"},
	}

	for _, tt := range tests {
		assert.Equal(t, tt.want, cleanWindows(tt.in), tt.in)
	}
}
