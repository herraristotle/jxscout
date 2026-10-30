package mcp

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/francisconeves97/jxscout/internal/core/findings"
	"github.com/jmoiron/sqlx"
)

// SecretMatch is one confident-tiered secret finding surfaced to agents.
type SecretMatch struct {
	Confidence string `json:"confidence"`
	Entropy    float64 `json:"entropy,omitempty"`
	Value      string `json:"value"`
	Type       string `json:"type"`
	URL        string `json:"url"`
	File       string `json:"file"`
}

// listSecrets is the jxscout_list_secrets tool handler: project-wide secret
// findings, confidence-filtered and sorted for agent triage.
func (s *Server) listSecrets(ctx context.Context, args map[string]any) (any, error) {
	project, _ := args["project"].(string)
	minConfidence, _ := args["min_confidence"].(string)

	if project == "" {
		return nil, fmt.Errorf("project parameter required")
	}

	projectPath, err := projectDir(project)
	if err != nil {
		return nil, err
	}
	dbPath := filepath.Join(projectPath, "db", "db.sql")
	if _, err := os.Stat(dbPath); err != nil {
		return nil, fmt.Errorf("project database not found: %w", err)
	}
	db, err := sqlx.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	matches, err := extractSecretMatches(ctx, db, project, minConfidence)
	if err != nil {
		return nil, err
	}

	if matches == nil {
		matches = []SecretMatch{}
	}
	result, err := json.Marshal(matches)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"content": []map[string]any{
			{
				"type": "text",
				"text": string(result),
			},
		},
	}, nil
}

// secretConfidenceTier orders confidence tiers for sorting (lower = better).
func secretConfidenceTier(c string) int {
	return findings.ConfidenceTier(c)
}

// secretConfidenceSatisfiesMin reports whether a match's confidence meets the
// caller's minimum.
func secretConfidenceSatisfiesMin(confidence, min string) bool {
	return findings.ConfidenceSatisfiesMin(confidence, min)
}

// extractSecretMatches reads every secrets-analyzer match for a project,
// converting tag names to secret types and filtering on confidence.
func extractSecretMatches(ctx context.Context, db *sqlx.DB, project, minConfidence string) ([]SecretMatch, error) {
	rows, err := db.QueryContext(ctx, `
		SELECT aa.results, a.url
		FROM ast_analysis_results aa
		JOIN assets a ON aa.asset_id = a.id
		WHERE a.project = ?
	`, project)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	matches := []SecretMatch{}
	for rows.Next() {
		var resultsJSON, assetURL string
		if err := rows.Scan(&resultsJSON, &assetURL); err != nil {
			continue
		}

		var results []map[string]interface{}
		if err := json.Unmarshal([]byte(resultsJSON), &results); err != nil {
			continue
		}

		for _, result := range results {
			if name, ok := result["analyzerName"].(string); !ok || name != "secrets" {
				continue
			}

			// Only matches tagged with "secret" are proper secret findings.
			tags, _ := result["tags"].(map[string]interface{})
			if tagged, ok := tags["secret"].(bool); !ok || !tagged {
				continue
			}

			value, ok := result["value"].(string)
			if !ok || value == "" {
				continue
			}

			extra, _ := result["extra"].(map[string]interface{})
			confidence, _ := extra["confidence"].(string)
			entropy, _ := extra["entropy"].(float64)

			if minConfidence != "" && !secretConfidenceSatisfiesMin(confidence, minConfidence) {
				continue
			}

			secretType := "unknown"
			for tag := range tags {
				if len(tag) > len("secret-type-") && tag[:len("secret-type-")] == "secret-type-" {
					secretType = tag[len("secret-type-"):]
					break
				}
			}

			file := ""
			if fp, ok := result["filePath"].(string); ok {
				file = fp
			}

			matches = append(matches, SecretMatch{
				Confidence: confidence,
				Entropy:    entropy,
				Value:      value,
				Type:       secretType,
				URL:        assetURL,
				File:       file,
			})
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	sort.SliceStable(matches, func(i, j int) bool {
		ti, tj := secretConfidenceTier(matches[i].Confidence), secretConfidenceTier(matches[j].Confidence)
		if ti != tj {
			return ti < tj
		}
		return matches[i].Value < matches[j].Value
	})
	return matches, nil
}
