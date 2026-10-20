package findingsmodule

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/francisconeves97/jxscout/internal/core/findings"
	jxscouttypes "github.com/francisconeves97/jxscout/pkg/types"
	"github.com/go-chi/chi"
)

// FindingsModule stores and exposes structured security findings (Pro v2 feature).
// Creating a finding publishes the finding_created hook event.
type FindingsModule struct {
	sdk *jxscouttypes.ModuleSDK
}

func NewFindingsModule() *FindingsModule {
	return &FindingsModule{}
}

func (m *FindingsModule) Initialize(sdk *jxscouttypes.ModuleSDK) error {
	m.sdk = sdk

	if err := findings.InitializeTable(sdk.Database); err != nil {
		return err
	}

	sdk.Router.Route("/findings", func(r jxscouttypes.Router) {
		r.Post("/", m.handleCreate)
		r.Get("/", m.handleList)
		r.Get("/{id}", m.handleGet)
	})

	sdk.Logger.Info("findings module initialized")
	return nil
}

func (m *FindingsModule) handleCreate(w http.ResponseWriter, r *http.Request) {
	var req findings.CreateRequest
	var body struct {
		Kind        string `json:"kind"`
		Severity    string `json:"severity"`
		Description string `json:"description"`
		DedupKey    string `json:"dedup_key"`
		Metadata    json.RawMessage `json:"metadata"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid request body", http.StatusBadRequest)
		return
	}
	req = findings.CreateRequest{
		Kind:        body.Kind,
		Severity:    body.Severity,
		Description: body.Description,
		DedupKey:    body.DedupKey,
	}
	if len(body.Metadata) > 0 {
		req.Metadata = string(body.Metadata)
	}

	id, deduped, err := findings.Create(r.Context(), m.sdk.Database, req)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	if deduped {
		m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, map[string]any{
			"success":    false,
			"finding_id": nil,
			"message":    "Finding was deduplicated (already exists)",
		})
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusCreated, map[string]any{
		"success":    true,
		"finding_id": id,
		"message":    "Finding created with ID: " + strconv.FormatInt(id, 10),
	})
}

func (m *FindingsModule) handleList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))

	items, total, err := findings.List(r.Context(), m.sdk.Database, q.Get("severity"), q.Get("kind"), limit, offset)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, map[string]any{
		"findings": items,
		"total":    total,
	})
}

func (m *FindingsModule) handleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "invalid finding id", http.StatusBadRequest)
		return
	}

	finding, err := findings.Get(r.Context(), m.sdk.Database, id)
	if err != nil {
		m.sdk.HTTPServer.SendErrorResponse(w, "finding not found", http.StatusNotFound)
		return
	}

	m.sdk.HTTPServer.SendSuccessResponse(w, http.StatusOK, finding)
}
