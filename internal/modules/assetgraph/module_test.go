package assetgraph

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupGraphDB(t *testing.T) *sqlx.DB {
	t.Helper()

	db, err := sqlx.Open("sqlite3", filepath.Join(t.TempDir(), "db.sql"))
	require.NoError(t, err)
	t.Cleanup(func() { db.Close() })

	_, err = db.Exec(`
		CREATE TABLE assets (
			id INTEGER PRIMARY KEY, url TEXT, content_type TEXT, fs_path TEXT,
			project TEXT, chunk_from_asset_id INTEGER, optimized_from INTEGER, unpacked_from INTEGER
		);
		CREATE TABLE asset_relationships (parent_id INTEGER, child_id INTEGER);
		CREATE TABLE sourcemaps (id INTEGER PRIMARY KEY, asset_id INTEGER, path TEXT);
		CREATE TABLE reversed_sourcemaps (id INTEGER PRIMARY KEY, sourcemap_id INTEGER, path TEXT);

		INSERT INTO assets VALUES
			(1, 'https://e/page.html', 'HTML', '/p/page.html', 'p', NULL, NULL, NULL),
			(2, 'https://e/app.js',    'JS',   '/p/app.js',    'p', NULL, NULL, NULL),
			(3, 'https://e/chunk.js',  'JS',   '/p/chunk.js',  'p', 2,    NULL, NULL),
			(4, 'https://e/app.min.js','JS',   '/p/app.min.js','p', NULL, 2,    NULL);
		INSERT INTO asset_relationships VALUES (1, 2);
		INSERT INTO sourcemaps VALUES (10, 2, '/p/app.js.map');
		INSERT INTO reversed_sourcemaps VALUES (20, 10, '/p/src/app.ts');
	`)
	require.NoError(t, err)
	return db
}

func TestCollectGraphRelations(t *testing.T) {
	db := setupGraphDB(t)

	nodes, err := collectGraph(context.Background(), db, "p", "https://e/app.js")
	require.NoError(t, err)

	byRelation := map[string][]string{}
	for _, n := range nodes {
		byRelation[n.Relation] = append(byRelation[n.Relation], n.URL+"|"+n.Path)
	}

	assert.Equal(t, []string{"https://e/page.html|/p/page.html"}, byRelation["loader"])
	assert.Equal(t, []string{"https://e/chunk.js|/p/chunk.js"}, byRelation["chunk"])
	assert.Equal(t, []string{"https://e/app.min.js|/p/app.min.js"}, byRelation["optimized"])
	assert.Len(t, byRelation["sourcemap_owner"], 1)
	assert.Equal(t, []string{"|/p/src/app.ts"}, byRelation["sourcemap_source"])
}

func TestCollectGraphUnknownAsset(t *testing.T) {
	db := setupGraphDB(t)

	nodes, err := collectGraph(context.Background(), db, "p", "https://e/missing.js")
	require.NoError(t, err)
	assert.Empty(t, nodes)
}
