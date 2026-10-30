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

// setupSecretsDB builds the minimal schema + data for listSecrets: one asset
// with secret matches at each confidence tier, one asset with no secrets.
func setupSecretsDB(t *testing.T) *sqlx.DB {
	t.Helper()

	db, err := sqlx.Open("sqlite3", filepath.Join(t.TempDir(), "db.sql"))
	require.NoError(t, err)
	t.Cleanup(func() { db.Close() })

	results := []struct {
		assetID int
		json    string
	}{
		{1, `[
			{"filePath":"a.js","analyzerName":"secrets","value":"AKIA1234567890123456","tags":{"secret":true,"secret-type-aws-api-key":true},"extra":{"confidence":"high","entropy":5.2}},
			{"filePath":"a.js","analyzerName":"secrets","value":"medium-secret-value-1","tags":{"secret":true,"secret-type-generic":true},"extra":{"confidence":"medium","entropy":3.2}},
			{"filePath":"a.js","analyzerName":"secrets","value":"low-secret-value-1","tags":{"secret":true,"secret-type-generic":true},"extra":{"confidence":"low","entropy":2.1}}
		]`},
		{2, `[{"analyzerName":"url-search-params","value":"page"}]`},
	}
	_, err = db.Exec(`
		CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT, project TEXT);
		CREATE TABLE ast_analysis_results (asset_id INTEGER, results TEXT);
		INSERT INTO assets (id, url, project) VALUES
			(1, 'https://example.com/static/app.js', 'p'),
			(2, 'https://example.com/static/other.js', 'p');
	`)
	require.NoError(t, err)
	for _, r := range results {
		_, err = db.Exec(`INSERT INTO ast_analysis_results (asset_id, results) VALUES (?, ?)`, r.assetID, r.json)
		require.NoError(t, err)
	}
	return db
}

func TestExtractSecretMatches(t *testing.T) {
	db := setupSecretsDB(t)

	matches, err := extractSecretMatches(context.Background(), db, "p", "")
	require.NoError(t, err)
	require.Len(t, matches, 3)

	// Sorted by confidence tier then value.
	assert.Equal(t, "high", matches[0].Confidence)
	assert.Equal(t, "AKIA1234567890123456", matches[0].Value)
	assert.Equal(t, "aws-api-key", matches[0].Type)
	assert.Equal(t, "https://example.com/static/app.js", matches[0].URL)
}

func TestExtractSecretMatchesFiltersConfidence(t *testing.T) {
	db := setupSecretsDB(t)

	matches, err := extractSecretMatches(context.Background(), db, "p", "high")
	require.NoError(t, err)
	require.Len(t, matches, 1)
	assert.Equal(t, "AKIA1234567890123456", matches[0].Value)
}

func TestExtractSecretMatchesSkipsNonSecrets(t *testing.T) {
	db := setupSecretsDB(t)

	// Empty confidence filter returns all; the asset with no secrets
	// contributes nothing.
	matches, err := extractSecretMatches(context.Background(), db, "p", "")
	require.NoError(t, err)
	for _, m := range matches {
		assert.NotEmpty(t, m.Value)
	}
}

// Confidence tier ordering: unknown confidence sorts last.
func TestSecretConfidenceTier(t *testing.T) {
	assert.Equal(t, 0, secretConfidenceTier("high"))
	assert.Equal(t, 1, secretConfidenceTier("medium"))
	assert.Equal(t, 2, secretConfidenceTier("low"))
	assert.Equal(t, 3, secretConfidenceTier("info"))
	assert.Equal(t, 4, secretConfidenceTier(""))
	assert.Equal(t, 4, secretConfidenceTier("bogus"))
}

// Min-confidence ordering: a match satisfies the floor when its tier is at
// least as good as the floor's tier. min="medium" accepts high and medium;
// min="info" accepts everything; min="high" accepts only high.
func TestSecretConfidenceSatisfiesMin(t *testing.T) {
	assert.True(t, secretConfidenceSatisfiesMin("high", "high"))
	assert.False(t, secretConfidenceSatisfiesMin("medium", "high"))
	assert.False(t, secretConfidenceSatisfiesMin("low", "high"))
	assert.False(t, secretConfidenceSatisfiesMin("info", "high"))
	assert.True(t, secretConfidenceSatisfiesMin("high", "medium"))
	assert.True(t, secretConfidenceSatisfiesMin("medium", "medium"))
	assert.False(t, secretConfidenceSatisfiesMin("low", "medium"))
	assert.True(t, secretConfidenceSatisfiesMin("high", "info"))
	assert.True(t, secretConfidenceSatisfiesMin("low", "low"))
	assert.True(t, secretConfidenceSatisfiesMin("info", "info"))
	assert.False(t, secretConfidenceSatisfiesMin("", "high"))
	assert.True(t, secretConfidenceSatisfiesMin("", "")) // no filter accepts unknown
}
