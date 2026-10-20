// Package agentskills auto-generates agent skill files (Pro v2 agent_skills feature)
// inside each project so AI agents (Claude Code, Cursor, ...) can leverage the CLI
// without any manual setup. Skills are the upstream jxscout-skills definitions,
// written unmodified.
package agentskills

import (
	"embed"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/francisconeves97/jxscout/internal/core/common"
)

//go:embed skills/*/SKILL.md
var skillsFS embed.FS

// Initialize writes the skills folder and .env for a project.
// agentsFolderName defaults to ".agents" (Pro v2 agent_skills.agents_folder_name).
func Initialize(projectName string, enabled bool, agentsFolderName string) error {
	if !enabled {
		return nil
	}
	if agentsFolderName == "" {
		agentsFolderName = ".agents"
	}

	projectDir := common.GetWorkingDirectory(projectName)
	skillsDir := filepath.Join(projectDir, agentsFolderName, "skills")

	err := fs.WalkDir(skillsFS, "skills", func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		content, err := skillsFS.ReadFile(path)
		if err != nil {
			return err
		}
		// skills/create-finding/SKILL.md -> <agents>/skills/create-finding/SKILL.md
		target := filepath.Join(projectDir, agentsFolderName, path)
		if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
			return err
		}
		return os.WriteFile(target, content, 0644)
	})
	if err != nil {
		return fmt.Errorf("failed to write agent skills: %w", err)
	}

	// .env consumed by agents (skills read JXSCOUT_PROJECT_NAME from it)
	envPath := filepath.Join(projectDir, ".env")
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		if err := os.WriteFile(envPath, []byte("JXSCOUT_PROJECT_NAME="+projectName+"\n"), 0644); err != nil {
			return fmt.Errorf("failed to write .env: %w", err)
		}
	}

	_ = skillsDir
	return nil
}
