import { describe, it, expect } from "vitest";
import { analyzeFile } from "../analyzer";
import path from "path";
import fs from "fs";

// Structural secret detectors (ported from jsrip's smart analysis):
// - sensitive-assignment    const apiKey = "value"
// - config-object           { secretKey: "value" }
// - env-fallback            process.env.DB_URL || "postgres://..." + info-level
//                           bare process.env.SECRET_KEY references
// - auth-header             headers: { Authorization: "Bearer ..." }

const dir = path.join(__dirname, "tests", "sensitive-data", "files");

function withFile(name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe("sensitive-assignment analyzer", () => {
  it("flags const assignment to a sensitive name with string value", () => {
    const p = withFile(
      "assign1.js",
      `const apiKey = "sk-live-9f8e7d6c5b4a3210";\nconsole.log(apiKey);\n`
    );
    const matches = analyzeFile(p, ["sensitive-assignment"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["sensitive-assignment"]).toBe(true);
    expect(matches[0].extra?.confidence).toBe("high");
  });

  it("ignores non-sensitive names", () => {
    const p = withFile(
      "assign2.js",
      `const greeting = "hello world string";\nconsole.log(greeting);\n`
    );
    expect(analyzeFile(p, ["sensitive-assignment"]).length).toBe(0);
  });

  it("ignores short / low-entropy values", () => {
    const p = withFile(
      "assign3.js",
      `const PASSWORD = "1234";\nconsole.log(PASSWORD);\n`
    );
    expect(analyzeFile(p, ["sensitive-assignment"]).length).toBe(0);
  });
});

describe("config-object analyzer", () => {
  it("flags object property with credential-ish name", () => {
    const p = withFile(
      "config1.js",
      `const cfg = { clientSecret: "9f8e7d6c5b4a3210fedcba9876543210" };\nconsole.log(cfg);\n`
    );
    const matches = analyzeFile(p, ["config-object"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["config-object"]).toBe(true);
  });

  it("ignores benign object props", () => {
    const p = withFile(
      "config2.js",
      `const cfg = { hostname: "example.com", title: "Dashboard" };\nconsole.log(cfg);\n`
    );
    expect(analyzeFile(p, ["config-object"]).length).toBe(0);
  });
});

describe("env-fallback analyzer", () => {
  it("flags hardcoded fallback after process.env", () => {
    const p = withFile(
      "env1.js",
      `const url = process.env.DATABASE_URL || "postgres://admin:hunter2@db.internal/prod";\n`
    );
    const matches = analyzeFile(p, ["env-fallback"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["env-fallback"]).toBe(true);
    expect(matches[0].extra?.confidence).toBe("high");
  });

  it("emits info-level match for bare sensitive process.env reference", () => {
    const p = withFile(
      "env2.js",
      `const key = process.env.STRIPE_SECRET_KEY;\nconsole.log(key);\n`
    );
    const matches = analyzeFile(p, ["env-fallback"]);
    expect(matches.length).toBe(1);
    expect(matches[0].extra?.confidence).toBe("info");
  });

  it("ignores non-sensitive env vars without fallback", () => {
    const p = withFile(
      "env3.js",
      `const port = process.env.PORT || 3000;\nconsole.log(port);\n`
    );
    expect(analyzeFile(p, ["env-fallback"]).length).toBe(0);
  });
});

describe("auth-header analyzer", () => {
  it("flags Authorization header with hardcoded bearer", () => {
    const p = withFile(
      "auth1.js",
      `fetch(url, { headers: { Authorization: "Bearer abc.def.ghi.1234567890" } });\n`
    );
    const matches = analyzeFile(p, ["auth-header"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["auth-header"]).toBe(true);
  });

  it("ignores dynamic auth headers", () => {
    const p = withFile(
      "auth2.js",
      `fetch(url, { headers: { Authorization: token } });\n`
    );
    expect(analyzeFile(p, ["auth-header"]).length).toBe(0);
  });
});
