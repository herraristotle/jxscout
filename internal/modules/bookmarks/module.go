package bookmarks

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
)

type Bookmark struct {
	ID          int64     `db:"id" json:"id"`
	AssetID     int64     `db:"asset_id" json:"asset_id"`
	AssetURL    string    `db:"asset_url" json:"asset_url"`
	Label       string    `db:"label" json:"label"`
	Description string    `db:"description" json:"description"`
	CodeSnippet string    `db:"code_snippet" json:"code_snippet"`
	StartLine   int       `db:"start_line" json:"start_line"`
	EndLine     int       `db:"end_line" json:"end_line"`
	Tags        string    `db:"tags" json:"tags"` // JSON array of tags
	Project     string    `db:"project" json:"project"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
	DeletedAt   *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`
}

type BookmarkModule struct {
	db  *sqlx.DB
	sdk *jxscouttypes.ModuleSDK
}

func NewBookmarkModule() *BookmarkModule {
	return &BookmarkModule{}
}

func (m *BookmarkModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk
	m.db = sdk.Database

	if err := m.InitializeSchema(sdk.Ctx); err != nil {
		return err
	}

	m.registerRoutes()
	return nil
}

func (m *BookmarkModule) registerRoutes() {
	m.sdk.Router.Route("/bookmarks", func(r chi.Router) {
		r.Get("/", m.handleList)
		r.Post("/", m.handleCreate)
		r.Get("/search", m.handleSearch)
		r.Get("/{id}", m.handleGet)
		r.Put("/{id}", m.handleUpdate)
		r.Delete("/{id}", m.handleDelete)
	})
}

type bookmarkPayload struct {
	AssetID     int64    `json:"asset_id"`
	AssetURL    string   `json:"asset_url"`
	Label       string   `json:"label"`
	Description string   `json:"description"`
	CodeSnippet string   `json:"code_snippet"`
	StartLine   int      `json:"start_line"`
	EndLine     int      `json:"end_line"`
	Tags        []string `json:"tags"`
}

func (m *BookmarkModule) handleList(w http.ResponseWriter, r *http.Request) {
	limit, offset, assetID := 100, 0, (*int64)(nil)
	if v := r.URL.Query().Get("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		fmt.Sscanf(v, "%d", &offset)
	}
	if v := r.URL.Query().Get("asset_id"); v != "" {
		var id int64
		fmt.Sscanf(v, "%d", &id)
		assetID = &id
	}

	bookmarks, total, err := m.ListBookmarks(r.Context(), m.sdk.Options.ProjectName, assetID, limit, offset)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, map[string]any{"bookmarks": bookmarks, "total": total})
}

func (m *BookmarkModule) handleCreate(w http.ResponseWriter, r *http.Request) {
	var payload bookmarkPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if payload.Label == "" {
		m.sdk.HTTPServer.SendErrorResponse(w, "label is required", http.StatusBadRequest)
		return
	}

	id, err := m.CreateBookmark(r.Context(), &Bookmark{
		AssetID:     payload.AssetID,
		AssetURL:    payload.AssetURL,
		Label:       payload.Label,
		Description: payload.Description,
		CodeSnippet: payload.CodeSnippet,
		StartLine:   payload.StartLine,
		EndLine:     payload.EndLine,
		Tags:        strings.Join(payload.Tags, ","),
		Project:     m.sdk.Options.ProjectName,
	})
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusCreated, map[string]any{"id": id})
}

func (m *BookmarkModule) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid bookmark id", http.StatusBadRequest)
		return
	}

	bookmark, err := m.GetBookmark(r.Context(), id)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if bookmark == nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "bookmark not found", http.StatusNotFound)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, bookmark)
}

func (m *BookmarkModule) handleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid bookmark id", http.StatusBadRequest)
		return
	}

	bookmark, err := m.GetBookmark(r.Context(), id)
	if err != nil || bookmark == nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "bookmark not found", http.StatusNotFound)
		return
	}

	var payload bookmarkPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid request body", http.StatusBadRequest)
		return
	}

	bookmark.Label = payload.Label
	bookmark.Description = payload.Description
	bookmark.CodeSnippet = payload.CodeSnippet
	bookmark.StartLine = payload.StartLine
	bookmark.EndLine = payload.EndLine
	bookmark.Tags = strings.Join(payload.Tags, ",")

	if err := m.UpdateBookmark(r.Context(), bookmark); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, bookmark)
}

func (m *BookmarkModule) handleDelete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid bookmark id", http.StatusBadRequest)
		return
	}

	if err := m.DeleteBookmark(r.Context(), id); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, nil)
}

func (m *BookmarkModule) handleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	bookmarks, err := m.SearchBookmarks(r.Context(), m.sdk.Options.ProjectName, query, 100)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, bookmarks)
}

func (m *BookmarkModule) InitializeSchema(ctx context.Context) error {
	_, err := m.db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS bookmarks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			asset_id INTEGER NOT NULL,
			asset_url TEXT NOT NULL,
			label TEXT NOT NULL,
			description TEXT,
			code_snippet TEXT,
			start_line INTEGER NOT NULL,
			end_line INTEGER NOT NULL,
			tags TEXT DEFAULT '[]',
			project TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			deleted_at DATETIME,
			FOREIGN KEY (asset_id) REFERENCES assets(id)
		);

		CREATE INDEX IF NOT EXISTS idx_bookmarks_asset_id ON bookmarks(asset_id);
		CREATE INDEX IF NOT EXISTS idx_bookmarks_project ON bookmarks(project);
		CREATE INDEX IF NOT EXISTS idx_bookmarks_deleted ON bookmarks(deleted_at);
	`)
	if err != nil {
		return errutil.Wrap(err, "failed to create bookmarks table")
	}
	return nil
}

func (m *BookmarkModule) CreateBookmark(ctx context.Context, b *Bookmark) (int64, error) {
	tagsJSON, _ := json.Marshal(b.Tags)
	result, err := m.db.ExecContext(ctx, `
		INSERT INTO bookmarks (asset_id, asset_url, label, description, code_snippet, start_line, end_line, tags, project)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, b.AssetID, b.AssetURL, b.Label, b.Description, b.CodeSnippet, b.StartLine, b.EndLine, string(tagsJSON), b.Project)
	if err != nil {
		return 0, errutil.Wrap(err, "failed to create bookmark")
	}
	id, _ := result.LastInsertId()
	return id, nil
}

func (m *BookmarkModule) GetBookmark(ctx context.Context, id int64) (*Bookmark, error) {
	var bookmark Bookmark
	err := m.db.GetContext(ctx, &bookmark, `
		SELECT * FROM bookmarks WHERE id = ? AND deleted_at IS NULL
	`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, errutil.Wrap(err, "failed to get bookmark")
	}
	return &bookmark, nil
}

func (m *BookmarkModule) ListBookmarks(ctx context.Context, project string, assetID *int64, limit, offset int) ([]*Bookmark, int, error) {
	query := `SELECT * FROM bookmarks WHERE project = ? AND deleted_at IS NULL`
	args := []interface{}{project}

	if assetID != nil {
		query += ` AND asset_id = ?`
		args = append(args, *assetID)
	}

	var total int
	countQuery := `SELECT COUNT(*) FROM bookmarks WHERE project = ? AND deleted_at IS NULL`
	countArgs := []interface{}{project}
	if assetID != nil {
		countQuery += ` AND asset_id = ?`
		countArgs = append(countArgs, *assetID)
	}
	err := m.db.GetContext(ctx, &total, countQuery, countArgs...)
	if err != nil {
		return nil, 0, errutil.Wrap(err, "failed to count bookmarks")
	}

	query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	args = append(args, limit, offset)

	var bookmarks []*Bookmark
	selectErr := m.db.SelectContext(ctx, &bookmarks, query, args...)
	if selectErr != nil {
		return nil, 0, errutil.Wrap(selectErr, "failed to list bookmarks")
	}

	return bookmarks, total, nil
}

func (m *BookmarkModule) UpdateBookmark(ctx context.Context, b *Bookmark) error {
	tagsJSON, _ := json.Marshal(b.Tags)
	_, err := m.db.ExecContext(ctx, `
		UPDATE bookmarks
		SET label = ?, description = ?, code_snippet = ?, start_line = ?, end_line = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ? AND deleted_at IS NULL
	`, b.Label, b.Description, b.CodeSnippet, b.StartLine, b.EndLine, string(tagsJSON), b.ID)
	if err != nil {
		return errutil.Wrap(err, "failed to update bookmark")
	}
	return nil
}

func (m *BookmarkModule) DeleteBookmark(ctx context.Context, id int64) error {
	_, err := m.db.ExecContext(ctx, `
		UPDATE bookmarks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
	`, id)
	if err != nil {
		return errutil.Wrap(err, "failed to delete bookmark")
	}
	return nil
}

func (m *BookmarkModule) SearchBookmarks(ctx context.Context, project, query string, limit int) ([]*Bookmark, error) {
	searchQuery := `
		SELECT * FROM bookmarks
		WHERE project = ? AND deleted_at IS NULL
		AND (label LIKE ? OR description LIKE ? OR code_snippet LIKE ?)
		ORDER BY created_at DESC LIMIT ?
	`
	pattern := "%" + query + "%"
	var bookmarks []*Bookmark
	err := m.db.SelectContext(ctx, &bookmarks, searchQuery, project, pattern, pattern, pattern, limit)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to search bookmarks")
	}
	return bookmarks, nil
}

func (m *BookmarkModule) GetBookmarksByAsset(ctx context.Context, assetID int64) ([]*Bookmark, error) {
	var bookmarks []*Bookmark
	err := m.db.SelectContext(ctx, &bookmarks, `
		SELECT * FROM bookmarks WHERE asset_id = ? AND deleted_at IS NULL ORDER BY start_line
	`, assetID)
	if err != nil {
		return nil, errutil.Wrap(err, "failed to get bookmarks by asset")
	}
	return bookmarks, nil
}