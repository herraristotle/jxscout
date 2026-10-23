package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsLikelyJavaScript(t *testing.T) {
	js := []string{
		"function foo() {}",
		"const foo = 1",
		"let x = 1",
		"var y=2",
		"const z;",
		"if (a) { b() }",
		"for (;;) {}",
		"while (x) {}",
		"const f = () => 1",
		"const s = `a ${x} b`",
	}
	for _, s := range js {
		assert.True(t, isLikelyJavaScript(s), s)
	}

	prose := []string{
		"Please let us know",
		"let us go",
		"toilet blah blah",
		"var(--brand)",
		"<html><body>hello</body></html>",
	}
	for _, s := range prose {
		assert.False(t, isLikelyJavaScript(s), s)
	}
}

func TestDetectContentType(t *testing.T) {
	html := "<!DOCTYPE html><html><body>hi</body></html>"
	assert.Equal(t, ContentTypeHTML, DetectContentType(&html))

	js := "function foo(){ return 1 }"
	assert.Equal(t, ContentTypeJS, DetectContentType(&js))

	prose := "Please let us know if this works"
	assert.Equal(t, "", DetectContentType(&prose))
}

func TestNormalizeURL(t *testing.T) {
	assert.Equal(t, "https://example.com/a", NormalizeURL("https://example.com/a/?q=1#f"))
	assert.Equal(t, "https://example.com", NormalizeURL("https://example.com/"))
	// Unparsable input is returned unchanged rather than dropped.
	assert.Equal(t, "http://[::1", NormalizeURL("http://[::1"))
}
