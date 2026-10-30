import { describe, it, expect } from "vitest";
import { analyzeFile } from "./analyzer";
import path from "path";
import fs from "fs";

// Every match from analyzeFile must carry a file-category-<x> tag derived
// from the file name (vendor/app/inline).

function withFixture(name: string, content: string): string {
  const dir = path.join(__dirname, "tests", "file-category", "files");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe("analyzeFile file-category tags", () => {
  it("tags matches from app files with file-category-app", () => {
    const p = withFixture("dashboard.js", `const url = "/api/users";\n`);
    const matches = analyzeFile(p, ["robust-paths"]);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.tags["file-category-app"]).toBe(true);
      expect(m.tags["file-category-vendor"]).toBeUndefined();
    }
  });

  it("tags matches from vendor files with file-category-vendor", () => {
    const p = withFixture("lodash.min.js", `const url = "/api/users";\n`);
    const matches = analyzeFile(p, ["robust-paths"]);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.tags["file-category-vendor"]).toBe(true);
    }
  });

  it("tags matches from inline files with file-category-inline", () => {
    const p = withFixture("inline_1.js", `const url = "/api/users";\n`);
    const matches = analyzeFile(p, ["robust-paths"]);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.tags["file-category-inline"]).toBe(true);
    }
  });
});
