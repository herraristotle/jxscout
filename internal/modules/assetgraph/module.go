package assetgraph

import (
	"context"
	"net/http"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
)

// Module exposes the HTML -> JS -> sourcemap -> reversed-source relationship
// graph that jxscout already records across several tables, so editors and
// agents can render it without knowing the schema.
type Module struct {
	sdk *jxscouttypes.ModuleSDK
}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	sdk.Router.Route("/api/asset-graph", func(r chi.Router) {
		r.Get("/", m.handleGet)
	})

	sdk.Logger.Info("asset-graph module initialized")
	return nil
}

// GraphNode is one asset in the relationship graph.
type GraphNode struct {
	URL         string `json:"url"`
	ContentType string `json:"content_type"`
	Path        string `json:"path,omitempty"`
	// Relation is how this node connects to the requested asset:
	// loader, loaded, chunk, sourcemap_owner, sourcemap_source, optimized,
	// unpacked.
	Relation string `json:"relation"`
}

type graphResponse struct {
	URL   string      `json:"url"`
	Nodes []GraphNode `json:"nodes"`
}

func (m *Module) handleGet(w http.ResponseWriter, r *http.Request) {
	url := common.NormalizeURL(r.URL.Query().Get("url"))
	path := r.URL.Query().Get("path")

	if url == "" && path == "" {
		m.sdk.HTTPServer.SendErrorResponse(w, "url or path parameter required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Editors only know the file on disk; resolve it to its asset URL.
	if url == "" {
		if err := m.sdk.Database.GetContext(ctx, &url,
			"SELECT url FROM assets WHERE fs_path = ? AND project = ? LIMIT 1",
			common.NormalizePathForDBCheck(path), m.sdk.Options.ProjectName); err != nil {
			m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, graphResponse{URL: path, Nodes: []GraphNode{}})
			return
		}
	}

	nodes, err := collectGraph(ctx, m.sdk.Database, m.sdk.Options.ProjectName, url)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, graphResponse{URL: url, Nodes: nodes})
}

func collectGraph(ctx context.Context, db *sqlx.DB, project, url string) ([]GraphNode, error) {
	var assetID int64
	err := db.GetContext(ctx, &assetID,
		"SELECT id FROM assets WHERE url = ? AND project = ?", url, project)
	if err != nil {
		// Not a tracked asset: nothing to traverse.
		return []GraphNode{}, nil
	}

	nodes := []GraphNode{}

	// HTML/JS loader relationships (asset_relationships).
	parents, err := queryNodes(ctx, db, `
		SELECT a.url, a.content_type, a.fs_path
		FROM assets a
		JOIN asset_relationships ar ON a.id = ar.parent_id
		WHERE ar.child_id = ?`, "loader", assetID)
	if err != nil {
		return nil, err
	}
	nodes = append(nodes, parents...)

	children, err := queryNodes(ctx, db, `
		SELECT a.url, a.content_type, a.fs_path
		FROM assets a
		JOIN asset_relationships ar ON a.id = ar.child_id
		WHERE ar.parent_id = ?`, "loaded", assetID)
	if err != nil {
		return nil, err
	}
	nodes = append(nodes, children...)

	// Chunks discovered from this asset.
	chunks, err := queryNodes(ctx, db, `
		SELECT url, content_type, fs_path FROM assets WHERE chunk_from_asset_id = ?`,
		"chunk", assetID)
	if err != nil {
		return nil, err
	}
	nodes = append(nodes, chunks...)

	// Optimized / unpacked derivatives.
	derived, err := queryRelationColumn(ctx, db, `
		SELECT url, content_type, fs_path, 'optimized' AS relation FROM assets WHERE optimized_from = ?
		UNION
		SELECT url, content_type, fs_path, 'unpacked' AS relation FROM assets WHERE unpacked_from = ?`,
		assetID, assetID)
	if err != nil {
		return nil, err
	}
	nodes = append(nodes, derived...)

	// Sourcemap owned by this asset.
	var sourcemapPath string
	err = db.GetContext(ctx, &sourcemapPath,
		"SELECT path FROM sourcemaps WHERE asset_id = ?", assetID)
	if err == nil {
		nodes = append(nodes, GraphNode{Path: sourcemapPath, Relation: "sourcemap_owner"})

		// Reversed sources produced from that sourcemap. They live on disk
		// only, so they carry a path and no URL.
		reversed, err := queryNodes(ctx, db, `
			SELECT '', '', r.path FROM reversed_sourcemaps r
			JOIN sourcemaps s ON r.sourcemap_id = s.id
			WHERE s.asset_id = ?`, "sourcemap_source", assetID)
		if err != nil {
			return nil, err
		}
		nodes = append(nodes, reversed...)
	}

	return nodes, nil
}

// queryRelationColumn is queryNodes for queries that select the relation label
// themselves (for UNIONs over different kinds of derivation).
func queryRelationColumn(ctx context.Context, db *sqlx.DB, query string, args ...interface{}) ([]GraphNode, error) {
	rows, err := db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query asset graph")
	}
	defer rows.Close()

	nodes := []GraphNode{}
	for rows.Next() {
		var n GraphNode
		if err := rows.Scan(&n.URL, &n.ContentType, &n.Path, &n.Relation); err != nil {
			return nil, errutil.Wrap(err, "failed to scan asset graph row")
		}
		nodes = append(nodes, n)
	}
	return nodes, rows.Err()
}

// queryNodes runs a query returning (url, content_type, path) plus a fixed
// relation label, or a relation column when the query supplies one.
func queryNodes(ctx context.Context, db *sqlx.DB, query, relation string, args ...interface{}) ([]GraphNode, error) {
	rows, err := db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to query asset graph")
	}
	defer rows.Close()

	nodes := []GraphNode{}
	for rows.Next() {
		var url, contentType, path string
		rel := relation
		if err := rows.Scan(&url, &contentType, &path); err != nil {
			return nil, errutil.Wrap(err, "failed to scan asset graph row")
		}
		nodes = append(nodes, GraphNode{URL: url, ContentType: contentType, Path: path, Relation: rel})
	}
	return nodes, rows.Err()
}
