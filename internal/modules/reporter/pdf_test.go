package reporter

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildPDFStructure(t *testing.T) {
	pdf := string(buildPDF([]string{"JXScout Report - demo", "Total Findings: 3"}))

	assert.True(t, strings.HasPrefix(pdf, "%PDF-1.4"))
	assert.True(t, strings.HasSuffix(pdf, "%%EOF\n"))
	assert.Contains(t, pdf, "/Type /Catalog")
	assert.Contains(t, pdf, "/BaseFont /Helvetica")
	assert.Contains(t, pdf, "startxref")
	// xref offset must point at the "xref" keyword.
	idx := strings.LastIndex(pdf, "startxref\n")
	require.Greater(t, idx, 0)
	var offset int
	_, err := fmt.Sscanf(strings.TrimSpace(pdf[idx+len("startxref\n"):]), "%d", &offset)
	require.NoError(t, err)
	assert.Equal(t, "xref", pdf[offset:offset+4])
}

func TestBuildPDFPaginates(t *testing.T) {
	lines := make([]string, pdfPageLines*2+5)
	for i := range lines {
		lines[i] = "line"
	}
	pdf := string(buildPDF(lines))
	assert.Equal(t, 3, strings.Count(pdf, "/Type /Page "))
}

func TestBuildPDFEscapesDelimiters(t *testing.T) {
	pdf := string(buildPDF([]string{`a (b) \c`}))
	assert.Contains(t, pdf, `(a \(b\) \\c) Tj`)
}

func TestBuildPDFRendersWithPoppler(t *testing.T) {
	pdftotext, err := exec.LookPath("pdftotext")
	if err != nil {
		t.Skip("pdftotext not installed")
	}

	dir := t.TempDir()
	pdfPath := filepath.Join(dir, "r.pdf")
	txtPath := filepath.Join(dir, "r.txt")
	require.NoError(t, os.WriteFile(pdfPath, buildPDF([]string{
		"JXScout Report - demo",
		"Total Findings: 3",
	}), 0644))

	out, err := exec.Command(pdftotext, pdfPath, txtPath).CombinedOutput()
	require.NoError(t, err, string(out))

	text, err := os.ReadFile(txtPath)
	require.NoError(t, err)
	assert.Contains(t, string(text), "JXScout Report - demo")
	assert.Contains(t, string(text), "Total Findings: 3")
}
