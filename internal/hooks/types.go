package hooks

import (
	"encoding/json"
	"fmt"
)

// HookConfig is the v2 hooks configuration, loaded from the merged
// project settings "hooks" key (see docs.v2.jxscout.app automation-with-hooks).
type HookConfig struct {
	// ProcessConfiguration holds optional global concurrency per process name.
	ProcessConfiguration map[string]ProcessGlobalConfig `json:"process_configuration,omitempty"`

	// Events maps event name -> process name -> process config.
	// Populated from every top-level key except process_configuration.
	Events map[string]map[string]ProcessConfig `json:"-"`
}

// ProcessGlobalConfig is the optional global config for a named process.
type ProcessGlobalConfig struct {
	Concurrency int `json:"concurrency"`
}

// ProcessConfig is a single hook process subscription.
type ProcessConfig struct {
	// Script is the shell command to run. $JXSCOUT_PROJECT_DIR is expanded.
	Script string `json:"script"`
	// Concurrency overrides the global process_configuration value (default 1).
	Concurrency *int `json:"concurrency,omitempty"`
}

// UnmarshalJSON parses the v2 layout:
//
//	{
//	  "process_configuration": {"notify": {"concurrency": 10}},
//	  "matches_created": {"check": {"script": "...", "concurrency": 5}},
//	  ...
//	}
func (h *HookConfig) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	h.ProcessConfiguration = map[string]ProcessGlobalConfig{}
	h.Events = map[string]map[string]ProcessConfig{}

	for key, value := range raw {
		if key == "process_configuration" {
			if err := json.Unmarshal(value, &h.ProcessConfiguration); err != nil {
				return fmt.Errorf("invalid process_configuration: %w", err)
			}
			continue
		}

		var processes map[string]ProcessConfig
		if err := json.Unmarshal(value, &processes); err != nil {
			return fmt.Errorf("invalid hook event %q: %w", key, err)
		}
		h.Events[key] = processes
	}

	return nil
}

// FileEventPayload is the stdin payload for file lifecycle events
// (js_file_saved, js_file_updated, js_file_beautified,
// html_file_saved, html_file_updated, html_file_beautified).
type FileEventPayload struct {
	FileType       string            `json:"file_type"` // "js" | "html" | "reversed_source"
	URL            string            `json:"url"`
	FilePath       string            `json:"file_path"`
	RequestHeaders map[string]string `json:"request_headers"`
}

// ReversedSourceMapPayload is the stdin payload for reversed_source_map_file_saved.
type ReversedSourceMapPayload struct {
	FileType string `json:"file_type"` // always "reversed_source"
	URL      string `json:"url"`
	FilePath string `json:"file_path"`
}

// MatchesCreatedPayload is the stdin payload for matches_created.
type MatchesCreatedPayload struct {
	FileType string        `json:"file_type"` // "js" | "html" | "reversed_source"
	FilePath string        `json:"file_path"`
	Matches  []MatchEntry  `json:"matches"`
}

// MatchEntry mirrors the Pro v2 match shape sent to hooks.
type MatchEntry struct {
	MatchKind  string   `json:"match_kind"`
	MatchValue string   `json:"match_value"`
	Position   Position `json:"position"`
}

// Position is a start/end location pair.
type Position struct {
	Start Location `json:"start"`
	End   Location `json:"end"`
}

// Location is a line/column pair (line 1-based, column 0-based).
type Location struct {
	Line   int64 `json:"line"`
	Column int64 `json:"column"`
}
