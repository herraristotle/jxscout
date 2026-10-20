package settings

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/xeipuuv/gojsonschema"
)

// Settings represents the merged settings from all three tiers
type Settings struct {
	Data map[string]interface{} `json:"-"`
	Schema *gojsonschema.Schema `json:"-"`
}

// TierPriority defines the settings hierarchy (higher = more specific)
const (
	TierGlobal = iota
	TierShared
	TierProject
)

// SettingsLoader handles loading and merging settings from all tiers
type SettingsLoader struct {
	projectName string
	schemaPath  string
}

func NewSettingsLoader(projectName string) *SettingsLoader {
	return &SettingsLoader{
		projectName: projectName,
		schemaPath:  filepath.Join(common.GetPrivateDirectory(projectName), "settings.schema.json"),
	}
}

// LoadSettings loads and merges settings from all three tiers
func (s *SettingsLoader) LoadSettings() (*Settings, error) {
	// Ensure default files exist (global + project settings/schema) on first run
	if err := s.ensureSchemaFiles(); err != nil {
		return nil, fmt.Errorf("failed to create default settings files: %w", err)
	}

	merged := make(map[string]interface{})

	// 1. Load global defaults
	if globalSettings, err := s.loadTier(filepath.Join(os.Getenv("HOME"), ".jxscout", "global_settings.jsonc")); err == nil {
		merged = deepMerge(merged, globalSettings)
	}

	// 2. Load shared settings
	if sharedSettings, err := s.loadTier(filepath.Join(os.Getenv("HOME"), ".jxscout", "shared_project_settings.jsonc")); err == nil {
		merged = deepMerge(merged, sharedSettings)
	}

	// 3. Load project-specific settings (highest priority)
	projectPath := filepath.Join(common.GetPrivateDirectory(s.projectName), "settings.jsonc")
	if projectSettings, err := s.loadTier(projectPath); err == nil {
		merged = deepMerge(merged, projectSettings)
	}

	// Load schema for validation
	schema, err := s.loadSchema()
	if err != nil {
		return nil, fmt.Errorf("failed to load schema: %w", err)
	}

	return &Settings{
		Data:   merged,
		Schema: schema,
	}, nil
}

func (s *SettingsLoader) loadTier(path string) (map[string]interface{}, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	cleaned := stripJSONComments(string(data))

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(cleaned), &result); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", path, err)
	}

	return result, nil
}

func (s *SettingsLoader) loadSchema() (*gojsonschema.Schema, error) {
	// Check for project-specific schema first
	projectSchemaPath := filepath.Join(common.GetPrivateDirectory(s.projectName), "settings.schema.json")
	if _, err := os.Stat(projectSchemaPath); err == nil {
		loader := gojsonschema.NewReferenceLoader("file://" + projectSchemaPath)
		return gojsonschema.NewSchema(loader)
	}

	// Check global schema
	globalSchemaPath := filepath.Join(os.Getenv("HOME"), ".jxscout", "settings.schema.json")
	if _, err := os.Stat(globalSchemaPath); err == nil {
		loader := gojsonschema.NewReferenceLoader("file://" + globalSchemaPath)
		return gojsonschema.NewSchema(loader)
	}

	// Create default schema from embedded file
	if err := s.ensureSchemaFiles(); err != nil {
		return nil, fmt.Errorf("failed to create default schema: %w", err)
	}

	// Try again after creation
	if _, err := os.Stat(globalSchemaPath); err == nil {
		loader := gojsonschema.NewReferenceLoader("file://" + globalSchemaPath)
		return gojsonschema.NewSchema(loader)
	}

	// No schema - return nil (validation skipped)
	return nil, nil
}

// ensureSchemaFiles creates default schema and settings files if they don't exist
func (s *SettingsLoader) ensureSchemaFiles() error {
	// Create ~/.jxscout directory
	jxscoutDir := filepath.Join(os.Getenv("HOME"), ".jxscout")
	if err := os.MkdirAll(jxscoutDir, 0755); err != nil {
		return err
	}

	// Create global schema if missing
	globalSchemaPath := filepath.Join(jxscoutDir, "settings.schema.json")
	if _, err := os.Stat(globalSchemaPath); os.IsNotExist(err) {
		schemaData := defaultSchemaJSON()
		if err := os.WriteFile(globalSchemaPath, []byte(schemaData), 0644); err != nil {
			return err
		}
	}

	// Create global settings if missing
	globalSettingsPath := filepath.Join(jxscoutDir, "global_settings.jsonc")
	if _, err := os.Stat(globalSettingsPath); os.IsNotExist(err) {
		settingsData := defaultGlobalSettings()
		if err := os.WriteFile(globalSettingsPath, []byte(settingsData), 0644); err != nil {
			return err
		}
	}

	// Create project schema if missing
	projectDir := common.GetPrivateDirectory(s.projectName)
	if err := os.MkdirAll(projectDir, 0755); err != nil {
		return err
	}

	projectSchemaPath := filepath.Join(projectDir, "settings.schema.json")
	if _, err := os.Stat(projectSchemaPath); os.IsNotExist(err) {
		schemaData := defaultSchemaJSON()
		if err := os.WriteFile(projectSchemaPath, []byte(schemaData), 0644); err != nil {
			return err
		}
	}

	// Create project settings template if missing (contains hooks v2 examples)
	projectSettingsPath := filepath.Join(projectDir, "settings.jsonc")
	if _, err := os.Stat(projectSettingsPath); os.IsNotExist(err) {
		settingsData := defaultProjectSettings(s.projectName)
		if err := os.WriteFile(projectSettingsPath, []byte(settingsData), 0644); err != nil {
			return err
		}
	}

	return nil
}

// Get retrieves a setting value by dot-notation key
func (s *Settings) Get(key string) (interface{}, bool) {
	keys := strings.Split(key, ".")
	current := s.Data

	for _, k := range keys {
		if val, ok := current[k]; ok {
			if m, ok := val.(map[string]interface{}); ok {
				current = m
			} else {
				return val, true
			}
		} else {
			return nil, false
		}
	}

	return current, true
}

// GetString retrieves a string setting
func (s *Settings) GetString(key string) (string, bool) {
	val, ok := s.Get(key)
	if !ok {
		return "", false
	}
	str, ok := val.(string)
	return str, ok
}

// GetInt retrieves an int setting
func (s *Settings) GetInt(key string) (int, bool) {
	val, ok := s.Get(key)
	if !ok {
		return 0, false
	}
	// JSON numbers are float64
	f, ok := val.(float64)
	return int(f), ok
}

// GetBool retrieves a bool setting
func (s *Settings) GetBool(key string) (bool, bool) {
	val, ok := s.Get(key)
	if !ok {
		return false, false
	}
	b, ok := val.(bool)
	return b, ok
}

// GetDuration retrieves a duration setting (in seconds)
func (s *Settings) GetDuration(key string) (int, bool) {
	val, ok := s.GetInt(key)
	return val, ok
}

// Validate validates settings against schema
func (s *Settings) Validate() error {
	if s.Schema == nil {
		return nil // No schema to validate against
	}

	jsonData, err := json.Marshal(s.Data)
	if err != nil {
		return fmt.Errorf("failed to marshal settings for validation: %w", err)
	}

	result, err := s.Schema.Validate(gojsonschema.NewStringLoader(string(jsonData)))
	if err != nil {
		return fmt.Errorf("validation error: %w", err)
	}

	if !result.Valid() {
		var errs []string
		for _, err := range result.Errors() {
			errs = append(errs, err.String())
		}
		return fmt.Errorf("settings validation failed: %s", strings.Join(errs, "; "))
	}

	return nil
}

// SaveProject saves settings to project-level file
func (s *Settings) SaveProject(projectName string) error {
	projectPath := filepath.Join(common.GetPrivateDirectory(projectName), "settings.jsonc")
	return s.saveToFile(s.Data, projectPath)
}

func (s *Settings) saveToFile(data map[string]interface{}, path string) error {
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	return os.WriteFile(path, jsonData, 0644)
}

// deepMerge merges src into dst, with src taking precedence
func deepMerge(dst, src map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	// Copy dst
	for k, v := range dst {
		result[k] = v
	}

	// Merge src
	for k, v := range src {
		if dstVal, exists := result[k]; exists {
			if dstMap, ok := dstVal.(map[string]interface{}); ok {
				if srcMap, ok := v.(map[string]interface{}); ok {
					result[k] = deepMerge(dstMap, srcMap)
					continue
				}
			}
		}
		result[k] = v
	}

	return result
}

// defaultSchemaJSON returns the default JSON schema
func defaultSchemaJSON() string {
	return `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "JXScout Project Settings",
  "type": "object",
  "properties": {
    "server": {
      "type": "object",
      "properties": {
        "hostname": { "type": "string", "default": "localhost" },
        "port": { "type": "integer", "default": 3333, "minimum": 1, "maximum": 65535 }
      }
    },
    "project": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "scope_patterns": { "type": "array", "items": { "type": "string" } },
        "debug": { "type": "boolean", "default": false }
      }
    },
    "concurrency": {
      "type": "object",
      "properties": {
        "asset_fetch": { "type": "integer", "default": 10, "minimum": 1 },
        "asset_save": { "type": "integer", "default": 5, "minimum": 1 },
        "http_request_ingestion": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "scope": {
          "type": "object",
          "properties": {
            "in_scope": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "max_saved_requests_per_unique_endpoint": { "type": "integer", "minimum": 1 },
                  "request_scope": {
                    "type": "object",
                    "properties": {
                      "host": { "type": "array", "items": { "type": "string" } },
                      "path": { "type": "array", "items": { "type": "string" } },
                      "method": { "type": "array", "items": { "type": "string" } }
                    }
                  }
                }
              }
            },
            "out_of_scope": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "max_saved_requests_per_unique_endpoint": { "type": "integer", "minimum": 1 },
                  "request_scope": {
                    "type": "object",
                    "properties": {
                      "host": { "type": "array", "items": { "type": "string" } },
                      "path": { "type": "array", "items": { "type": "string" } },
                      "method": { "type": "array", "items": { "type": "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "beautifier": { "type": "integer", "default": 3, "minimum": 1 },
        "chunk_discoverer": { "type": "integer", "default": 5, "minimum": 1 },
        "ast_analyzer": { "type": "integer", "default": 5, "minimum": 1 },
        "optimizer": { "type": "integer", "default": 3, "minimum": 1 },
        "unpacker": { "type": "integer", "default": 3, "minimum": 1 }
      }
    },
    "beautifier": {
      "type": "object",
      "properties": {
        "transformations": {
          "type": "object",
          "properties": {
            "iterations": { "type": "integer", "minimum": 1, "default": 1 },
            "transformers": {
              "type": "array",
              "items": { "type": "string", "enum": ["json_parse", "variable_inliner", "string_concat"] }
            }
          }
        }
      }
    },
    "chunk_discovery": {
      "type": "object",
      "properties": {
        "brute_force_limit": { "type": "integer", "default": 100, "minimum": 0 },
        "google_lazy_chunks": { "type": "boolean", "default": false }
      }
    },
    "cache": {
      "type": "object",
      "properties": {
        "js_requests_ttl": { "type": "string", "default": "24h" },
        "html_requests_ttl": { "type": "string", "default": "1h" }
      }
    },
    "rate_limiting": {
      "type": "object",
      "properties": {
        "max_requests_per_second": { "type": "integer", "default": 10, "minimum": 1 },
        "max_requests_per_minute": { "type": "integer", "default": 0, "minimum": 0 },
        "per_host_limits": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        }
      }
    },
    "features": {
      "type": "object",
      "properties": {
        "optimizer_enabled": { "type": "boolean", "default": true },
        "unpacker_enabled": { "type": "boolean", "default": true },
        "screenshots_enabled": { "type": "boolean", "default": false },
        "hooks_enabled": { "type": "boolean", "default": false }
      }
    },
    "hooks": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "additionalProperties": {
          "type": "object",
          "properties": {
            "script": { "type": "string" },
            "concurrency": { "type": "integer", "minimum": 1 }
          },
          "required": ["script"]
        }
      },
      "properties": {
        "process_configuration": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "concurrency": { "type": "integer", "minimum": 1 }
            }
          }
        }
      }
    },
    "memory": {
      "type": "object",
      "properties": {
        "limit_mb": { "type": "integer", "default": 0, "minimum": 0 },
        "check_interval": { "type": "string", "default": "30s" },
        "beautifier_limit_mb": { "type": "integer", "default": 512 },
        "chunk_discoverer_limit_mb": { "type": "integer", "default": 512 },
        "ast_analyzer_limit_mb": { "type": "integer", "default": 512 },
        "optimizer_limit_mb": { "type": "integer", "default": 512 },
        "unpacker_limit_mb": { "type": "integer", "default": 512 }
      }
    },
    "mcp": {
      "type": "object",
      "properties": {
        "hostname": { "type": "string", "default": "localhost" },
        "port": { "type": "integer", "default": 9998 }
      }
    },
    "overrides": {
      "type": "object",
      "properties": {
        "caido_hostname": { "type": "string", "default": "localhost" },
        "caido_port": { "type": "integer", "default": 8080 },
        "check_interval": { "type": "string", "default": "5m" }
      }
    },
    "proxy_rotation": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "strategy": { "type": "string", "enum": ["round-robin", "random", "least-used"], "default": "round-robin" },
        "max_failures": { "type": "integer", "default": 3 }
      }
    },
    "screenshots": {
      "type": "object",
      "properties": {
        "concurrency": { "type": "integer", "default": 2, "minimum": 1 },
        "timeout": { "type": "string", "default": "30s" },
        "viewport": { "type": "string", "default": "1920x1080" }
      }
    },
    "monitoring_notifier": {
      "type": "object",
      "properties": {
        "discord_webhook_url": { "type": "string" },
        "notify_js_file_updates": { "type": "boolean", "default": true },
        "notify_new_js_files": { "type": "boolean", "default": true },
        "notify_new_js_matches": { "type": "boolean", "default": true },
        "notify_request_failures": { "type": "boolean", "default": true },
        "notify_html_file_updates": { "type": "boolean", "default": false },
        "notify_new_html_matches": { "type": "boolean", "default": false }
      }
    }
  }
}`
}

// defaultProjectSettings returns the template project settings file created on first run
func defaultProjectSettings(projectName string) string {
	return fmt.Sprintf(`// JXScout project settings (auto-generated - see https://docs.v2.jxscout.app/docs/tutorial/automation-with-hooks/)
{
  "$schema": "file://%s",
  "project": {
    "name": %q
  },
  "hooks": {
    // v2 hooks: event -> process name -> { script, concurrency }
    // Available events:
    //   js_file_saved, js_file_updated, js_file_beautified,
    //   html_file_saved, html_file_updated, html_file_beautified,
    //   reversed_source_map_file_saved, matches_created, finding_created
    // Scripts receive the event payload as JSON on stdin and have
    // JXSCOUT_PROJECT_DIR / JXSCOUT_PROJECT_NAME env vars available.
    //
    // Example (create scripts/log_payload.sh first):
    // "process_configuration": {
    //   "log_payload": { "concurrency": 10 }
    // },
    // "js_file_saved": {
    //   "log_payload": { "script": "$JXSCOUT_PROJECT_DIR/scripts/log_payload.sh js_file_saved" }
    // },
    // "matches_created": {
    //   "log_payload": { "script": "$JXSCOUT_PROJECT_DIR/scripts/log_payload.sh matches_created", "concurrency": 5 }
    // }
  }
  },
  "monitoring_notifier": {
    "discord_webhook_url": "",
    "notify_js_file_updates": true,
    "notify_new_js_files": true,
    "notify_new_js_matches": true,
    "notify_request_failures": true,
    "notify_html_file_updates": false,
    "notify_new_html_matches": false
  },
  "agent_skills": {
    "enabled": true,
    "agents_folder_name": ".agents"
  }
}`, filepath.Join(common.GetPrivateDirectory(projectName), "settings.schema.json"), projectName)
}

// defaultGlobalSettings returns the default global settings
func defaultGlobalSettings() string {
	return `// JXScout Global Settings
{
  "server": {
    "hostname": "localhost",
    "port": 3333
  },
  "project": {
    "name": "",
    "scope_patterns": [],
    "debug": false
  },
  "concurrency": {
    "asset_fetch": 10,
    "asset_save": 5,
    "beautifier": 3,
    "chunk_discoverer": 5,
    "ast_analyzer": 5,
    "optimizer": 3,
    "unpacker": 3
  },
  "chunk_discovery": {
    "brute_force_limit": 100,
    "google_lazy_chunks": false
  },
  "cache": {
    "js_requests_ttl": "24h",
    "html_requests_ttl": "1h"
  },
  "rate_limiting": {
    "max_requests_per_second": 10,
    "max_requests_per_minute": 0
  },
  "features": {
    "optimizer_enabled": true,
    "unpacker_enabled": true,
    "screenshots_enabled": false,
    "hooks_enabled": false
  },
  "hooks": {},
  "memory": {
    "limit_mb": 0,
    "check_interval": "30s",
    "beautifier_limit_mb": 512,
    "chunk_discoverer_limit_mb": 512,
    "ast_analyzer_limit_mb": 512,
    "optimizer_limit_mb": 512,
    "unpacker_limit_mb": 512
  },
  "mcp": {
    "hostname": "localhost",
    "port": 9998
  },
  "overrides": {
    "caido_hostname": "localhost",
    "caido_port": 8080,
    "check_interval": "5m"
  },
  "proxy_rotation": {
    "enabled": false,
    "strategy": "round-robin",
    "max_failures": 3
  },
  "screenshots": {
    "concurrency": 2,
    "timeout": "30s",
    "viewport": "1920x1080"
  },
  "monitoring_notifier": {
    "discord_webhook_url": "",
    "notify_js_file_updates": true,
    "notify_new_js_files": true,
    "notify_new_js_matches": true,
    "notify_request_failures": true,
    "notify_html_file_updates": false,
    "notify_new_html_matches": false
  },
  "agent_skills": {
    "enabled": { "type": "boolean", "default": true },
    "agents_folder_name": { "type": "string", "default": ".agents" }
  }
}`
}

// stripJSONComments removes // and /* */ comments from JSONC
func stripJSONComments(jsonc string) string {
	var result strings.Builder
	inString := false
	inLineComment := false
	inBlockComment := false

	for i := 0; i < len(jsonc); i++ {
		ch := jsonc[i]

		if ch == '"' && !inLineComment && !inBlockComment {
			if i == 0 || jsonc[i-1] != '\\' {
				inString = !inString
			}
			result.WriteByte(ch)
			continue
		}

		if inString {
			result.WriteByte(ch)
			continue
		}

		if !inBlockComment && i+1 < len(jsonc) && ch == '/' && jsonc[i+1] == '/' {
			inLineComment = true
			i++
			continue
		}

		if inLineComment {
			if ch == '\n' {
				inLineComment = false
				result.WriteByte(ch)
			}
			continue
		}

		if !inLineComment && i+1 < len(jsonc) && ch == '/' && jsonc[i+1] == '*' {
			inBlockComment = true
			i++
			continue
		}

		if inBlockComment {
			if i+1 < len(jsonc) && ch == '*' && jsonc[i+1] == '/' {
				inBlockComment = false
				i++
			}
			continue
		}

		result.WriteByte(ch)
	}

	return result.String()
}