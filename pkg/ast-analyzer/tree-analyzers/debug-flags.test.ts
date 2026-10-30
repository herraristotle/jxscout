import { describe, it, expect } from "vitest";
import { analyzeFile } from "../analyzer";
import path from "path";
import fs from "fs";

// debug-flags (ported from jsrip inspector.py): exposed debug/feature-flag
// state in client code — DEBUG: true, isDev: true, featureFlags presence,
// __DEV__, ?debug= URL params.

function withFixture(name: string, content: string) {
  const dir = path.join(__dirname, "tests", "debug-flags", "files");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe("debug-flags analyzer", () => {
  it("flags DEBUG: true assignments", () => {
    const p = withFixture("debug1.js", `const config = { DEBUG: true };\nconsole.log(config);\n`);
    const matches = analyzeFile(p, ["debug-flags"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["debug-flag"]).toBe(true);
  });

  it("flags isDev: true", () => {
    const p = withFixture("debug2.js", `const env = { isDev: true };\nconsole.log(env);\n`);
    const matches = analyzeFile(p, ["debug-flags"]);
    expect(matches.length).toBe(1);
  });

  it("ignores isDev: false", () => {
    const p = withFixture("debug3.js", `const env = { isDev: false };\nconsole.log(env);\n`);
    expect(analyzeFile(p, ["debug-flags"]).length).toBe(0);
  });

  it("flags __DEV__ references", () => {
    const p = withFixture("debug4.js", `if (__DEV__) { console.warn("dev"); }\n`);
    const matches = analyzeFile(p, ["debug-flags"]);
    expect(matches.length).toBe(1);
  });

  it("ignores normal configs", () => {
    const p = withFixture("debug5.js", `const env = { host: "example.com" };\nconsole.log(env);\n`);
    expect(analyzeFile(p, ["debug-flags"]).length).toBe(0);
  });
});
