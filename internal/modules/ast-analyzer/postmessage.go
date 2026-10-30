package astanalyzer

// File-level postMessage origin risk, ported from jsrip inspector.py:
// a file that posts messages or listens for message events but performs no
// event.origin check anywhere gets flagged. Detection is per-file over
// analyzer matches — postmessage/message-listener presence from the
// dedicated tree-analyzers, origin reads from the origin-read analyzer.

// PostMessageOriginRisk is the file-level assessment result.
type PostMessageOriginRisk struct {
	IsRisk           bool     `json:"is_risk"`
	AnalyzersPresent []string `json:"analyzers_present"`
}

var postMessageActivityAnalyzers = []string{"postmessage", "message-listener"}
var originReadAnalyzers = []string{"origin-read"}

func analyzerAnalyzersPresent(matches []AnalyzerMatch) (present []string) {
	names := make(map[string]bool)
	for _, m := range matches {
		names[m.AnalyzerName] = true
	}
	for _, name := range postMessageActivityAnalyzers {
		if names[name] {
			present = append(present, name)
		}
	}
	return present
}

func analyzerHasOriginRead(matches []AnalyzerMatch) bool {
	for _, m := range matches {
		for _, name := range originReadAnalyzers {
			if m.AnalyzerName == name {
				return true
			}
		}
	}
	return false
}

func correlatePostMessageOriginRisk(matches []AnalyzerMatch) PostMessageOriginRisk {
	present := analyzerAnalyzersPresent(matches)
	isRisk := len(present) > 0 && !analyzerHasOriginRead(matches)
	return PostMessageOriginRisk{
		IsRisk:           isRisk,
		AnalyzersPresent: present,
	}
}
