package astanalyzer

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// findNodeByLabel walks the tree looking for a node with the given label.
func findNodeByLabel(nodes []ASTAnalyzerTreeNode, label string) *ASTAnalyzerTreeNode {
	for i := range nodes {
		if nodes[i].Label == label {
			return &nodes[i]
		}
		if found := findNodeByLabel(nodes[i].Children, label); found != nil {
			return found
		}
	}
	return nil
}

func collectMatchValues(nodes []ASTAnalyzerTreeNode) []string {
	values := []string{}
	var walk func(ns []ASTAnalyzerTreeNode)
	walk = func(ns []ASTAnalyzerTreeNode) {
		for _, n := range ns {
			if n.Type == ASTAnalyzerTreeNodeTypeMatch {
				if m, ok := n.Data.(AnalyzerMatch); ok {
					values = append(values, m.Value)
				} else {
					values = append(values, n.Label)
				}
			}
			walk(n.Children)
		}
	}
	walk(nodes)
	return values
}

func countMatchNodes(nodes []ASTAnalyzerTreeNode) int {
	count := 0
	for _, n := range nodes {
		if n.Type == ASTAnalyzerTreeNodeTypeMatch {
			count++
		}
		count += countMatchNodes(n.Children)
	}
	return count
}

// TestFormatMatchesV1 asserts that each match lands in the navigation path the
// v2 descriptors tree defines, instead of deep-equalling the whole tree (which
// made the test brittle against icon/description changes).
func TestFormatMatchesV1(t *testing.T) {
	tests := []struct {
		name        string
		match       AnalyzerMatch
		path        []string
		rootLabel   string
	}{
		{
			name:      "api path match",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "/api/users", Tags: map[string]bool{"api": true}},
			rootLabel: "Data",
			path:      []string{"Data", "Paths", "API"},
		},
		{
			name:      "is-url path match",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "https://example.com", Tags: map[string]bool{"is-url": true}},
			rootLabel: "Data",
			path:      []string{"Data", "Paths", "URL Paths"},
		},
		{
			name:      "extension with other tag",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "asd.js", Tags: map[string]bool{"is-extension": true, "extension-js": true}},
			rootLabel: "Data",
			path:      []string{"Data", "Extensions"},
		},
		{
			name:      "regex match",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "regex.test('x')", Tags: map[string]bool{"regex-match": true}},
			rootLabel: "Data",
			path:      []string{"Data", "Regex", "Regex Match"},
		},
		{
			name:      "secret",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "sk_live_abc", Tags: map[string]bool{"secret": true, "secret-type-stripe": true}},
			rootLabel: "Data",
			path:      []string{"Data", "Secrets"},
		},
		{
			name:      "graphql query",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "query { user }", Tags: map[string]bool{"graphql-query": true}},
			rootLabel: "Data",
			path:      []string{"Data", "GraphQL", "Query"},
		},
		{
			name:      "postMessage event",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "window.postMessage('x')", Tags: map[string]bool{"postMessage": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "Events", "postMessage"},
		},
		{
			name:      "cookie manipulation",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "document.cookie = 'a=b'", Tags: map[string]bool{"cookie-manipulation": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "Storage", "Cookie"},
		},
		{
			name:      "localStorage",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "localStorage.getItem('k')", Tags: map[string]bool{"local-storage": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "Storage", "localStorage"},
		},
		{
			name:      "eval",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "eval('1')", Tags: map[string]bool{"eval": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "eval"},
		},
		{
			name:      "onhashchange",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "window.onhashchange", Tags: map[string]bool{"onhashchange": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "Events", "onhashchange"},
		},
		{
			name:      "innerHTML",
			match:     AnalyzerMatch{FilePath: "test.go", AnalyzerName: "test", Value: "el.innerHTML = 'x'", Tags: map[string]bool{"inner-html": true}},
			rootLabel: "Client Behavior",
			path:      []string{"Client Behavior", "innerHTML"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatMatchesV1([]AnalyzerMatch{tt.match})

			require.NotEmpty(t, result, "expected at least one root node")

			// Walk the expected path one level at a time.
			nodes := result
			for depth, label := range tt.path {
				node := findNodeByLabel(nodes, label)
				require.NotNilf(t, node, "missing node %q at depth %d (%v)", label, depth, tt.path)
				nodes = node.Children
			}

			assert.Equal(t, []string{tt.match.Value}, collectMatchValues(nodes))
		})
	}
}

func TestFormatMatchesV1Empty(t *testing.T) {
	result := formatMatchesV1([]AnalyzerMatch{})
	assert.Empty(t, result)
	assert.Equal(t, 0, countMatchNodes(result))
}

// postmessage-origin-risk matches must surface under the postMessage node.
func TestPostMessageOriginRiskSurfaced(t *testing.T) {
	match := AnalyzerMatch{
		FilePath:     "test.js",
		AnalyzerName: "postmessage",
		Value:        "window.postMessage('x')",
		Tags:         map[string]bool{"postMessage": true, "postmessage-origin-risk": true},
	}
	result := formatMatchesV1([]AnalyzerMatch{match})

	behavior := findNodeByLabel(result, "Client Behavior")
	require.NotNil(t, behavior)
	events := findNodeByLabel(behavior.Children, "Events")
	require.NotNil(t, events)
	postMessage := findNodeByLabel(events.Children, "postMessage")
	require.NotNil(t, postMessage)

	assert.Equal(t, []string{match.Value}, collectMatchValues(postMessage.Children))
}

// debug-flags matches must surface under a Debug Flags node in Client Behavior.
func TestDebugFlagsSurfaced(t *testing.T) {
	match := AnalyzerMatch{
		FilePath:     "test.js",
		AnalyzerName: "debug-flags",
		Value:        "{ DEBUG: true }",
		Tags:         map[string]bool{"debug-flag": true},
	}
	result := formatMatchesV1([]AnalyzerMatch{match})

	behavior := findNodeByLabel(result, "Client Behavior")
	require.NotNil(t, behavior)
	flags := findNodeByLabel(behavior.Children, "Debug Flags")
	require.NotNil(t, flags, "Debug Flags node missing")
	assert.Equal(t, []string{match.Value}, collectMatchValues(flags.Children))
}
func TestSecretMatchTooltipCarriesConfidence(t *testing.T) {
	match := AnalyzerMatch{
		FilePath:     "test.go",
		AnalyzerName: "test",
		Value:        "sk_live_abc123",
		Tags:         map[string]bool{"secret": true, "secret-type-stripe": true},
		Extra:        map[string]any{"confidence": "high", "entropy": 5.2},
	}
	result := formatMatchesV1([]AnalyzerMatch{match})

	secrets := findNodeByLabel(result, "Secrets")
	require.NotNil(t, secrets, "secrets node missing")
	stripe := findNodeByLabel(secrets.Children, "stripe")
	require.NotNil(t, stripe, "secret-type node missing")

	require.Len(t, stripe.Children, 1)
	matchNode := stripe.Children[0]
	assert.Contains(t, matchNode.Tooltip, "confidence: high")
	assert.Contains(t, matchNode.Tooltip, "entropy: 5.2")
}

// Secrets without Extra (older bundled analyzer output) must not get a
// tooltip or crash.
func TestSecretMatchWithoutExtra(t *testing.T) {
	match := AnalyzerMatch{
		FilePath:     "test.go",
		AnalyzerName: "test",
		Value:        "sk_live_abc123",
		Tags:         map[string]bool{"secret": true, "secret-type-stripe": true},
	}
	result := formatMatchesV1([]AnalyzerMatch{match})

	secrets := findNodeByLabel(result, "Secrets")
	require.NotNil(t, secrets)
	stripe := findNodeByLabel(secrets.Children, "stripe")
	require.NotNil(t, stripe)
	require.Len(t, stripe.Children, 1)
	assert.Empty(t, stripe.Children[0].Tooltip)
}

func TestFormatMatchesV1UnknownTagsIgnored(t *testing.T) {
	result := formatMatchesV1([]AnalyzerMatch{
		{FilePath: "test.go", AnalyzerName: "test", Value: "whatever", Tags: map[string]bool{"not-a-known-tag": true}},
	})
	assert.Empty(t, result)
}

func TestFormatMatchesV1WithExampleData(t *testing.T) {
	matchesJSON, err := os.ReadFile("example/matches.json")
	require.NoError(t, err, "failed to read matches.json")

	var matches []AnalyzerMatch
	require.NoError(t, json.Unmarshal(matchesJSON, &matches), "failed to unmarshal matches.json")

	result := formatMatchesV1(matches)
	require.NotNil(t, result)
	require.NotEmpty(t, result)

	// Every match must be placed at least once; matches whose only tags are
	// outside the descriptor taxonomy (e.g. dom-xss) are intentionally dropped,
	// so assert the recognized ones are all present.
	placedValues := collectMatchValues(result)
	placed := make(map[string]bool, len(placedValues))
	for _, v := range placedValues {
		placed[v] = true
	}

	recognized := 0
	for _, m := range matches {
		if hasAnyMatches(tagsToMap(m), dataTags) ||
			hasAnyMatches(tagsToMap(m), clientBehaviorTags) ||
			hasAnyMatches(tagsToMap(m), frameworkTags) ||
			hasAnyMatches(tagsToMap(m), objectSchemasTags) {
			recognized++
			assert.Truef(t, placed[m.Value], "recognized match %q was not placed in the tree", m.Value)
		}
	}
	assert.Greater(t, recognized, 0, "expected at least one recognized match")
	assert.GreaterOrEqual(t, countMatchNodes(result), recognized)

	// Root categories from the v2 descriptors tree.
	categories := map[string]bool{}
	for _, n := range result {
		categories[n.Label] = true
	}
	for _, category := range []string{"Data", "Client Behavior"} {
		assert.Truef(t, categories[category], "expected root category %q to be present", category)
	}

	// Spot-check known values.
	for _, value := range []string{"/api/users", "window.postMessage('data', '*')", "document.cookie = 'session=123'"} {
		assert.Truef(t, placed[value], "expected %q in tree", value)
	}
}

func tagsToMap(m AnalyzerMatch) map[string][]AnalyzerMatch {
	out := make(map[string][]AnalyzerMatch, len(m.Tags))
	for tag := range m.Tags {
		out[tag] = append(out[tag], m)
	}
	return out
}
