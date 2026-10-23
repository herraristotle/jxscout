package common

import (
	"strings"
	"testing"
)

var sampleJS = `function fetchUser(id){ return fetch("/api/users/"+id).then(r=>r.json()) }
const API_KEY = "AKIAIOSFODNN7EXAMPLE";
document.getElementById("out").innerHTML = location.hash;
window.addEventListener("message", e => eval(e.data));
`

func BenchmarkIsLikelyJavaScript(b *testing.B) {
	for range b.N {
		isLikelyJavaScript(sampleJS)
	}
}

func BenchmarkDetectContentType(b *testing.B) {
	for range b.N {
		DetectContentType(&sampleJS)
	}
}

func BenchmarkNormalizeURL(b *testing.B) {
	for range b.N {
		NormalizeURL("https://example.com/path/to/asset.js?v=1#frag")
	}
}

func BenchmarkHash(b *testing.B) {
	content := strings.Repeat(sampleJS, 1000)
	for range b.N {
		Hash(content)
	}
}
