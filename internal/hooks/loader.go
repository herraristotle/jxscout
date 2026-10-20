package hooks

import (
	"encoding/json"
	"fmt"

	"github.com/francisconeves97/jxscout/internal/settings"
)

// LoadHooks extracts the v2 hooks configuration from the merged project settings
// (defaults -> global -> shared -> project settings.jsonc).
func LoadHooks(projectName string) (*HookConfig, error) {
	loader := settings.NewSettingsLoader(projectName)
	s, err := loader.LoadSettings()
	if err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}

	raw, ok := s.Get("hooks")
	if !ok {
		return nil, fmt.Errorf("no hooks configured in settings")
	}

	// Re-marshal to trigger v2 structure parsing
	data, err := json.Marshal(raw)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal hooks config: %w", err)
	}

	var config HookConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse hooks config: %w", err)
	}

	if len(config.Events) == 0 {
		return nil, fmt.Errorf("hooks config has no event subscriptions")
	}

	return &config, nil
}
