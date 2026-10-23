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

func TestSchemaFileURL(t *testing.T) {
	if got := schemaFileURL("/home/user/settings.schema.json"); got != "file:///home/user/settings.schema.json" {
		t.Fatalf("unix abs: got %q", got)
	}
	if got := schemaFileURL("C:\\Users\\admin\\settings.schema.json"); got != "file:///C:/Users/admin/settings.schema.json" {
		t.Fatalf("windows drive: got %q", got)
	}
	if got := schemaFileURL("/C:/foo/bar"); got != "file:///C:/foo/bar" {
		t.Fatalf("mixed: got %q", got)
	}
}
