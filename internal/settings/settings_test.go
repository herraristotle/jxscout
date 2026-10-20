package settings

import (
	"fmt"
	"testing"
)

func TestLoadSettings(t *testing.T) {
	loader := NewSettingsLoader("testhook")
	s, err := loader.LoadSettings()
	if err != nil {
		t.Logf("Error: %v", err)
		return
	}
	fmt.Printf("Loaded settings: %+v\n", s.Data)
}
