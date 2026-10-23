package mcp

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupWordlistDB builds the minimal schema the wordlist queries need, with
// one asset carrying results from several analyzers.
func setupWordlistDB(t *testing.T) *sqlx.DB {
	t.Helper()

	db, err := sqlx.Open("sqlite3", filepath.Join(t.TempDir(), "db.sql"))
	require.NoError(t, err)
	t.Cleanup(func() { db.Close() })

	_, err = db.Exec(`
		CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT, project TEXT);
		CREATE TABLE ast_analysis_results (asset_id INTEGER, results TEXT);
		INSERT INTO assets (id, url, project) VALUES
			(1, 'https://example.com/api/users?page=1', 'p'),
			(2, 'https://example.com/static/app.js', 'p');
		INSERT INTO ast_analysis_results (asset_id, results) VALUES
			(1, '[{"analyzerName":"secrets","value":"AKIA123"},{"analyzerName":"secrets","value":"AKIA456"}]'),
			(2, '[{"analyzerName":"url-search-params","value":"page"},{"analyzerName":"dependency-confusion","value":"lodash"}]');
	`)
	require.NoError(t, err)
	return db
}

func TestExtractAnalyzerValues(t *testing.T) {
	db := setupWordlistDB(t)

	secrets, err := extractAnalyzerValues(context.Background(), db, "p", "secrets")
	require.NoError(t, err)
	assert.Equal(t, []string{"AKIA123", "AKIA456"}, secrets)

	params, err := extractAnalyzerValues(context.Background(), db, "p", "url-search-params")
	require.NoError(t, err)
	assert.Equal(t, []string{"page"}, params)

	packages, err := extractAnalyzerValues(context.Background(), db, "p", "dependency-confusion")
	require.NoError(t, err)
	assert.Equal(t, []string{"lodash"}, packages)

	none, err := extractAnalyzerValues(context.Background(), db, "p", "does-not-exist")
	require.NoError(t, err)
	assert.Empty(t, none)
}

func TestExtractPathsFromDB(t *testing.T) {
	db := setupWordlistDB(t)

	paths, err := extractPathsFromDB(context.Background(), db, "p")
	require.NoError(t, err)
	assert.Equal(t, []string{"api", "app.js", "example.com", "https:", "static", "users?page=1"}, paths)
}

func TestGenerateWordlistTypes(t *testing.T) {
	db := setupWordlistDB(t)
	// generateWordlist opens its own DB from the project dir, so exercise the
	// dispatch through the extractors it calls.
	for _, tc := range []struct{ wlType, analyzer string }{
		{"secrets", "secrets"},
		{"params", "url-search-params"},
		{"packages", "dependency-confusion"},
	} {
		got, err := extractAnalyzerValues(context.Background(), db, "p", tc.analyzer)
		require.NoError(t, err, tc.wlType)
		assert.NotEmpty(t, got, tc.wlType)
	}
}
