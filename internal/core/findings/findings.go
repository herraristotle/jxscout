package findings

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

// TopicFindingCreated is published whenever a new (non-deduplicated) finding is stored.
const TopicFindingCreated = "findings.finding_created"

// Valid severities accepted by create-finding (Pro v2 skill contract).
var validSeverities = map[string]bool{
	"low": true, "medium": true, "high": true, "critical": true,
}

// ConfidenceTier orders secret-match confidence tiers (lower = more certain).
// Unknown or missing confidence sorts last.
func ConfidenceTier(c string) int {
	switch c {
	case "high":
		return 0
	case "medium":
		return 1
	case "low":
		return 2
	case "info":
		return 3
	default:
		return 4
	}
}

// ConfidenceSatisfiesMin reports whether a match's confidence meets the
// caller's minimum. An unknown/missing confidence only satisfies an empty
// (no-filter) minimum.
func ConfidenceSatisfiesMin(confidence, min string) bool {
	if min == "" {
		return true
	}
	return ConfidenceTier(confidence) <= ConfidenceTier(min)
}

// Finding is a structured security finding (Pro v2 findings feature).
type Finding struct {
	ID          int64             `db:"id" json:"finding_id"`
	Kind        string            `db:"kind" json:"kind"`
	Severity    string            `db:"severity" json:"severity"`
	Description *string           `db:"description" json:"description,omitempty"`
	DedupKey    *string           `db:"dedup_key" json:"dedup_key,omitempty"`
	Metadata    map[string]any    `db:"-" json:"metadata,omitempty"`
	CreatedAt   string            `db:"created_at" json:"created_at"`
}

type dbFinding struct {
	ID          int64  `db:"id"`
	Kind        string `db:"kind"`
	Severity    string `db:"severity"`
	Description *string `db:"description"`
	DedupKey    *string `db:"dedup_key"`
	Metadata    *string `db:"metadata"`
	CreatedAt   string `db:"created_at"`
}

// CreateRequest is the input for creating a finding.
type CreateRequest struct {
	Kind        string
	Severity    string
	Description string
	DedupKey    string
	Metadata    string // raw JSON object string
}

// InitializeTable creates the findings table and dedup index if missing.
func InitializeTable(db *sqlx.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS findings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			kind TEXT NOT NULL,
			severity TEXT NOT NULL,
			description TEXT,
			dedup_key TEXT,
			metadata TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
		CREATE UNIQUE INDEX IF NOT EXISTS idx_findings_kind_dedup
			ON findings(kind, dedup_key) WHERE dedup_key IS NOT NULL;
	`)
	return err
}

// Create stores a finding, deduplicating on (kind, dedup_key).
// Returns the finding id (0 when deduplicated) and whether it was deduplicated.
// On successful creation it publishes TopicFindingCreated on the events table
// so subscribers (hooks) receive the finding_created event.
func Create(ctx context.Context, db *sqlx.DB, req CreateRequest) (int64, bool, error) {
	if req.Kind == "" {
		return 0, false, fmt.Errorf("kind is required")
	}
	if !validSeverities[req.Severity] {
		return 0, false, fmt.Errorf("invalid severity %q (must be low|medium|high|critical)", req.Severity)
	}
	if req.Metadata != "" && !json.Valid([]byte(req.Metadata)) {
		return 0, false, fmt.Errorf("metadata must be valid JSON")
	}

	var dedupKey *string
	if req.DedupKey != "" {
		dedupKey = &req.DedupKey
	}
	var description *string
	if req.Description != "" {
		description = &req.Description
	}
	var metadata *string
	if req.Metadata != "" {
		metadata = &req.Metadata
	}

	// dedup check: same kind + dedup_key already exists
	if dedupKey != nil {
		var existingID int64
		err := db.GetContext(ctx, &existingID, "SELECT id FROM findings WHERE kind = ? AND dedup_key = ?", req.Kind, req.DedupKey)
		if err == nil {
			return 0, true, nil
		}
		if err != sql.ErrNoRows {
			return 0, false, fmt.Errorf("failed to check dedup: %w", err)
		}
	}

	res, err := db.ExecContext(ctx,
		"INSERT INTO findings (kind, severity, description, dedup_key, metadata) VALUES (?, ?, ?, ?, ?)",
		req.Kind, req.Severity, description, dedupKey, metadata)
	if err != nil {
		// unique index race - treat as deduplicated
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return 0, true, nil
		}
		return 0, false, fmt.Errorf("failed to insert finding: %w", err)
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, false, fmt.Errorf("failed to get finding id: %w", err)
	}

	// publish finding_created for hook subscribers (same mechanism as CLI asset events)
	payload := map[string]any{
		"finding_id":  id,
		"kind":        req.Kind,
		"severity":    req.Severity,
		"description": description,
		"dedup_key":   dedupKey,
	}
	if metadata != nil {
		var meta map[string]any
		if json.Unmarshal([]byte(*metadata), &meta) == nil {
			payload["metadata"] = meta
		}
	}
	payloadJSON, err := json.Marshal(payload)
	if err == nil {
		if _, err := db.ExecContext(ctx, "INSERT INTO events (name, payload) VALUES (?, ?)", TopicFindingCreated, string(payloadJSON)); err != nil {
			// non-fatal: finding stored, event lost
			_ = err
		}
	}

	return id, false, nil
}

// List returns findings with optional severity/kind filters, newest first.
func List(ctx context.Context, db *sqlx.DB, severity, kind string, limit, offset int) ([]Finding, int, error) {
	if limit <= 0 {
		limit = 50
	}

	where := []string{}
	args := []any{}
	if severity != "" {
		where = append(where, "severity = ?")
		args = append(args, severity)
	}
	if kind != "" {
		where = append(where, "kind = ?")
		args = append(args, kind)
	}
	filter := ""
	if len(where) > 0 {
		filter = "WHERE " + strings.Join(where, " AND ")
	}

	var total int
	if err := db.GetContext(ctx, &total, "SELECT COUNT(*) FROM findings "+filter, args...); err != nil {
		return nil, 0, err
	}

	listArgs := append(append([]any{}, args...), limit, offset)
	rows := []dbFinding{}
	query := "SELECT id, kind, severity, description, dedup_key, metadata, created_at FROM findings " +
		filter + " ORDER BY id DESC LIMIT ? OFFSET ?"
	if err := db.SelectContext(ctx, &rows, query, listArgs...); err != nil {
		return nil, 0, err
	}

	findings := make([]Finding, 0, len(rows))
	for _, r := range rows {
		f := Finding{
			ID:          r.ID,
			Kind:        r.Kind,
			Severity:    r.Severity,
			Description: r.Description,
			DedupKey:    r.DedupKey,
			CreatedAt:   r.CreatedAt,
		}
		if r.Metadata != nil {
			var meta map[string]any
			if json.Unmarshal([]byte(*r.Metadata), &meta) == nil {
				f.Metadata = meta
			}
		}
		findings = append(findings, f)
	}

	return findings, total, nil
}

// Get returns a single finding by id.
func Get(ctx context.Context, db *sqlx.DB, id int64) (Finding, error) {
	var r dbFinding
	if err := db.GetContext(ctx, &r, "SELECT id, kind, severity, description, dedup_key, metadata, created_at FROM findings WHERE id = ?", id); err != nil {
		return Finding{}, err
	}
	f := Finding{
		ID:          r.ID,
		Kind:        r.Kind,
		Severity:    r.Severity,
		Description: r.Description,
		DedupKey:    r.DedupKey,
		CreatedAt:   r.CreatedAt,
	}
	if r.Metadata != nil {
		var meta map[string]any
		if json.Unmarshal([]byte(*r.Metadata), &meta) == nil {
			f.Metadata = meta
		}
	}
	return f, nil
}
