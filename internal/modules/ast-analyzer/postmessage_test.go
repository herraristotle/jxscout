package astanalyzer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// File-level postMessage risk flag (ported from jsrip inspector.py): a file
// that posts messages or listens for message events but performs no
// event.origin check anywhere is flagged as origin-risk.

func TestNoRiskWhenNoPostMessageActivity(t *testing.T) {
	matches := []AnalyzerMatch{
		{AnalyzerName: "fetch"},
		{AnalyzerName: "eval"},
	}
	risk := correlatePostMessageOriginRisk(matches)
	assert.False(t, risk.IsRisk)
	assert.Empty(t, risk.AnalyzersPresent)
}

func TestRiskWhenPostMessageWithoutOriginRead(t *testing.T) {
	matches := []AnalyzerMatch{
		{AnalyzerName: "postmessage"},
	}
	risk := correlatePostMessageOriginRisk(matches)
	assert.True(t, risk.IsRisk)
	assert.Contains(t, risk.AnalyzersPresent, "postmessage")
}

func TestRiskWhenMessageListenerWithoutOriginRead(t *testing.T) {
	matches := []AnalyzerMatch{
		{AnalyzerName: "message-listener"},
	}
	risk := correlatePostMessageOriginRisk(matches)
	assert.True(t, risk.IsRisk)
}

func TestNoRiskWhenOriginReadPresent(t *testing.T) {
	for _, hasListener := range []string{"postmessage", "message-listener"} {
		matches := []AnalyzerMatch{
			{AnalyzerName: hasListener},
			{AnalyzerName: "origin-read"},
		}
		risk := correlatePostMessageOriginRisk(matches)
		assert.False(t, risk.IsRisk, "origin-read must clear risk for "+hasListener)
	}
}

// Both postmessage AND listener together, no origin read — still one risk.
func TestRiskBundlesBothAnalyzers(t *testing.T) {
	matches := []AnalyzerMatch{
		{AnalyzerName: "postmessage"},
		{AnalyzerName: "message-listener"},
	}
	risk := correlatePostMessageOriginRisk(matches)
	assert.True(t, risk.IsRisk)
	assert.ElementsMatch(t, risk.AnalyzersPresent, []string{"postmessage", "message-listener"})
}

// Irrelevant analyzer names must not trigger or clear risk.
func TestNoiseAnalyzersIgnored(t *testing.T) {
	matches := []AnalyzerMatch{
		{AnalyzerName: "fetch"},
		{AnalyzerName: "message-listener"}, // risky
		{AnalyzerName: "origin-read"},
		{AnalyzerName: "secrets"},
	}
	risk := correlatePostMessageOriginRisk(matches)
	assert.False(t, risk.IsRisk)
	assert.Contains(t, risk.AnalyzersPresent, "message-listener")
}
