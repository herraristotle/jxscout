import { describe, it, expect } from "vitest";
import { analyzeFile } from "./analyzer";
import path from "path";

// Integration: the secrets analyzer must attach confidence tiers via the
// false-positive filter stack (ported from jsrip) and drop clear junk.

const fixture = path.join(__dirname, "tests", "secrets", "files", "1.js");

describe("secrets analyzer confidence integration", () => {
  const matches = analyzeFile(fixture, ["secrets"]);

  it("returns matches", () => {
    expect(matches.length).toBeGreaterThan(0);
  });

  it("every surviving secret match carries a confidence extra", () => {
    for (const m of matches) {
      expect(m.extra?.confidence).toBeDefined();
      expect(["high", "medium", "low", "info"]).toContain(m.extra.confidence);
    }
  });

  it("filters out obviously fake values (placeholders, css colors)", () => {
    const values = new Set(matches.map((m) => m.value));
    expect(values.has("YOUR_API_KEY")).toBe(false);
    expect(values.has("#ff5733")).toBe(false);
    expect(values.has("CHANGEME")).toBe(false);
  });

  it("keeps real high-confidence secrets", () => {
    const high = matches.filter((m) => m.extra?.confidence === "high");
    expect(high.length).toBeGreaterThan(0);
    // AKIA keys must survive with high confidence
    const aws = high.find((m) => m.value.startsWith("AKIA"));
    expect(aws).toBeDefined();
  });
});
