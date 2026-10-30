package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/spf13/pflag"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// newTestProject lays out the same on-disk shape jxscout creates: a working
// directory with a db/db.sql that the CLI subcommands read directly.
func newTestProject(t *testing.T, project string) string {
	t.Helper()

	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)

	private := filepath.Join(home, ".jxscout", project, "db")
	require.NoError(t, os.MkdirAll(private, 0o755))

	db, err := sqlx.Open("sqlite3", filepath.Join(private, "db.sql"))
	require.NoError(t, err)
	defer db.Close()

	_, err = db.Exec(`
		CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT, project TEXT,
			content_type TEXT, content_hash TEXT, fs_path TEXT, request_headers TEXT,
			is_inline_js BOOLEAN, is_chunk_discovered BOOLEAN, chunk_from_asset_id INTEGER,
			is_beautified BOOLEAN, is_optimized BOOLEAN, optimized_from INTEGER,
			is_unpacked BOOLEAN, unpacked_from INTEGER, created_at DATETIME, updated_at DATETIME);
		CREATE TABLE ast_analysis_results (id INTEGER PRIMARY KEY, asset_id INTEGER,
			asset_type TEXT, results TEXT, deleted_at DATETIME);
		CREATE TABLE findings (id INTEGER PRIMARY KEY, kind TEXT, severity TEXT,
			description TEXT, dedup_key TEXT, metadata TEXT, created_at DATETIME);
		INSERT INTO assets (id, url, project, content_type) VALUES
			(1, 'https://example.com/api/users', 'p', 'JS'),
			(2, 'https://example.com/static/app.js', 'p', 'JS');
		INSERT INTO ast_analysis_results (asset_id, asset_type, results) VALUES
			(2, 'asset', '[{"analyzerName":"secrets","value":"AKIA123"}]');
	`)
	require.NoError(t, err)

	return private
}

// captureStdout runs fn with os.Stdout redirected, since several subcommands
// print directly rather than through cobra's writer.
func captureStdout(t *testing.T, fn func() error) (string, error) {
	t.Helper()

	orig := os.Stdout
	r, w, err := os.Pipe()
	require.NoError(t, err)
	os.Stdout = w

	runErr := fn()

	require.NoError(t, w.Close())
	os.Stdout = orig
	t.Cleanup(func() { os.Stdout = orig })

	var buf bytes.Buffer
	_, _ = buf.ReadFrom(r)
	return buf.String(), runErr
}

// pflag keeps a flag's value and Changed bit across Execute calls, and these
// tests drive several invocations in one process: without a reset, a flag set by
// an earlier one silently applies to the next. Only Changed flags are reset —
// tests assign some package-level values (projectName) directly.
func runRoot(t *testing.T, args ...string) (string, error) {
	t.Helper()

	out := &bytes.Buffer{}
	rootCmd.SetOut(out)
	rootCmd.SetErr(out)

	for _, fs := range []*pflag.FlagSet{rootCmd.PersistentFlags(), rootCmd.Flags(), queryCmd.Flags()} {
		fs.VisitAll(resetFlag)
	}

	rootCmd.SetArgs(args)
	t.Cleanup(func() {
		rootCmd.SetArgs(nil)
	})

	err := rootCmd.Execute()
	return out.String(), err
}

func resetFlag(f *pflag.Flag) {
	if !f.Changed {
		return
	}
	_ = f.Value.Set(f.DefValue)
	f.Changed = false
}

func TestWordlistPathsJSON(t *testing.T) {
	newTestProject(t, "p")
	projectName = "p"
	outputFormat = "json"
	wordlistType = "paths"

	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "wordlist", "-t", "paths", "-o", "json")
		return err
	})
	require.NoError(t, err)

	var list []string
	require.NoError(t, json.Unmarshal([]byte(out), &list))
	assert.Contains(t, list, "api")
	assert.Contains(t, list, "app.js")
}

func TestWordlistUnknownTypeFails(t *testing.T) {
	newTestProject(t, "p")
	projectName = "p"
	wordlistType = "nonsense"

	_, err := runRoot(t, "wordlist", "-t", "nonsense")
	require.Error(t, err)
	assert.True(t, strings.Contains(err.Error(), "unknown wordlist type"), err.Error())
}

func TestListFindingsEmpty(t *testing.T) {
	newTestProject(t, "p")
	projectName = "p"

	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "list-findings")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "findings")
}

func TestPrintFullSettings(t *testing.T) {
	newTestProject(t, "p")
	projectName = "p"

	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "print-full-project-settings")
		return err
	})
	require.NoError(t, err)

	assert.Contains(t, out, "\"server\"")
	assert.Contains(t, out, "\"hostname\"")
}

// Fixture with descriptors carrying analyzerName, tags (incl. file-category-*)
// and extra.confidence, to exercise the query command's filters. The fixture
// rows are written inline in each test after newTestProject.

func TestQueryDescriptorsByFileCategory(t *testing.T) {
	private := newTestProject(t, "p")
	db, err := sqlx.Open("sqlite3", filepath.Join(private, "db.sql"))
	require.NoError(t, err)
	defer db.Close()

	results := `[{"filePath":"app.js","analyzerName":"secrets","value":"AKIA12345",
		"tags":{"secret":true,"secret-type-aws-api-key":true,"file-category-app":true},
		"extra":{"confidence":"high","entropy":5.0}},
		{"filePath":"vendor.js","analyzerName":"secrets","value":"AKIA99990",
		"tags":{"secret":true,"secret-type-generic":true,"file-category-vendor":true},
		"extra":{"confidence":"low","entropy":2.0}}]`
	_, err = db.Exec(`UPDATE ast_analysis_results SET results = ? WHERE asset_id = 2`, results)
	require.NoError(t, err)
	db.Close()

	projectName = "p"

	// app filter keeps only the app match
	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "query", "-t", "descriptors", "--file-category", "app")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "AKIA12345")
	assert.NotContains(t, out, "AKIA99990")

	// vendor filter keeps only the vendor match
	out, err = captureStdout(t, func() error {
		_, err := runRoot(t, "query", "-t", "descriptors", "--file-category", "vendor")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "AKIA99990")
	assert.NotContains(t, out, "AKIA12345")

	// no filter keeps both
	out, err = captureStdout(t, func() error {
		_, err := runRoot(t, "query", "-t", "descriptors")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "AKIA12345")
	assert.Contains(t, out, "AKIA99990")
}

func TestQueryDescriptorsByConfidence(t *testing.T) {
	private := newTestProject(t, "p")
	db, err := sqlx.Open("sqlite3", filepath.Join(private, "db.sql"))
	require.NoError(t, err)
	defer db.Close()

	results := `[{"filePath":"app.js","analyzerName":"secrets","value":"AKIAHIGH1",
		"tags":{"secret":true},"extra":{"confidence":"high"}},
		{"filePath":"app.js","analyzerName":"secrets","value":"AKIALOW000",
		"tags":{"secret":true},"extra":{"confidence":"low"}}]`
	_, err = db.Exec(`UPDATE ast_analysis_results SET results = ? WHERE asset_id = 2`, results)
	require.NoError(t, err)
	db.Close()

	projectName = "p"

	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "query", "-t", "descriptors", "--min-confidence", "high")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "AKIAHIGH1")
	assert.NotContains(t, out, "AKIALOW000")
}

func TestQueryDescriptorsByAnalyzer(t *testing.T) {
	private := newTestProject(t, "p")
	db, err := sqlx.Open("sqlite3", filepath.Join(private, "db.sql"))
	require.NoError(t, err)
	defer db.Close()

	results := `[{"filePath":"app.js","analyzerName":"secrets","value":"AKIA12345","tags":{"secret":true}},
		{"filePath":"app.js","analyzerName":"eval","value":"eval(x)","tags":{"eval":true}}]`
	_, err = db.Exec(`UPDATE ast_analysis_results SET results = ? WHERE asset_id = 2`, results)
	require.NoError(t, err)
	db.Close()

	projectName = "p"

	out, err := captureStdout(t, func() error {
		_, err := runRoot(t, "query", "-t", "descriptors", "--analyzer", "eval")
		return err
	})
	require.NoError(t, err)
	assert.Contains(t, out, "eval(x)")
	assert.NotContains(t, out, "AKIA12345")
}
