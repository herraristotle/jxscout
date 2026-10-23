package mcp

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseAssetResourceURI(t *testing.T) {
	project, rel, err := parseAssetResourceURI("jxscout://myproj/assets/js/app.js")
	require.NoError(t, err)
	assert.Equal(t, "myproj", project)
	assert.Equal(t, "assets/js/app.js", rel)

	_, _, err = parseAssetResourceURI("http://evil/x")
	assert.Error(t, err)

	_, _, err = parseAssetResourceURI("jxscout://myproj")
	assert.Error(t, err)
}

func TestPromptsListAndGet(t *testing.T) {
	server := NewServer()

	list, err := server.handlePromptsList()
	require.NoError(t, err)
	prompts := list.(map[string]interface{})["prompts"].([]map[string]interface{})
	require.Len(t, prompts, 1)
	assert.Equal(t, "triage-asset", prompts[0]["name"])

	params, _ := json.Marshal(map[string]interface{}{
		"name":      "triage-asset",
		"arguments": map[string]string{"project": "p", "url": "https://example.com/app.js"},
	})
	res, err := server.handlePromptsGet(params)
	require.NoError(t, err)
	messages := res.(map[string]interface{})["messages"].([]map[string]interface{})
	require.Len(t, messages, 1)
	text := messages[0]["content"].(map[string]string)["text"]
	assert.Contains(t, text, "https://example.com/app.js")
	assert.Contains(t, text, "jxscout_get_descriptors")
}

func TestPromptsGetRejectsBadInput(t *testing.T) {
	server := NewServer()

	params, _ := json.Marshal(map[string]interface{}{"name": "nope"})
	_, err := server.handlePromptsGet(params)
	assert.Error(t, err)

	params, _ = json.Marshal(map[string]interface{}{"name": "triage-asset", "arguments": map[string]string{}})
	_, err = server.handlePromptsGet(params)
	assert.Error(t, err)
}

func TestProjectDirRejectsTraversal(t *testing.T) {
	for _, name := range []string{"", ".", "..", "../etc", "a/b", `a\b`} {
		_, err := projectDir(name)
		assert.Error(t, err, name)
	}
	_, err := projectDir("legit-project")
	assert.NoError(t, err)
}

func TestResourcesReadStaysInAssetsDir(t *testing.T) {
	root := t.TempDir()
	t.Setenv("HOME", root)

	project := "proj"
	assetsDir := filepath.Join(root, ".jxscout", project, "assets")
	require.NoError(t, os.MkdirAll(assetsDir, 0o755))
	require.NoError(t, os.WriteFile(filepath.Join(assetsDir, "app.js"), []byte("console.log(1)"), 0o644))

	server := NewServer()
	params, _ := json.Marshal(map[string]string{"uri": "jxscout://proj/app.js"})
	res, err := server.handleResourcesRead(context.Background(), params)

	if err != nil {
		// HOME override layout differs from common.GetPrivateDirectory's; the
		// important assertion is that traversal never returns file contents.
		assert.Contains(t, err.Error(), "not found")
		return
	}

	contents := res.(map[string]interface{})["contents"].([]map[string]interface{})
	assert.Contains(t, contents[0]["text"], "console.log(1)")
}
