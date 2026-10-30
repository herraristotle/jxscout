import { describe, it, expect } from "vitest";
import { analyzeFile } from "../analyzer";
import path from "path";
import fs from "fs";

// origin-read: reads of event.origin / e.origin / <x>.origin — used to
// correlate postMessage/message-listener activity with a missing origin
// check (postMessage-origin-risk file-level flag).

function withFixture(name: string, content: string) {
  const dir = path.join(__dirname, "tests", "origin-read", "files");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe("origin-read analyzer", () => {
  it("flags event.origin reads", () => {
    const p = withFixture("origin1.js", `
      window.addEventListener("message", (event) => {
        if (event.origin !== "https://trusted.example") return;
        eval(event.data);
      });
    `);
    const matches = analyzeFile(p, ["origin-read"]);
    expect(matches.length).toBe(1);
    expect(matches[0].tags["origin-read"]).toBe(true);
  });

  it("flags short-name origin reads (e.origin)", () => {
    const p = withFixture("origin2.js", `
      window.onmessage = (e) => {
        if (e.origin === allowed) {
          document.write(e.data);
        }
      };
    `);
    const matches = analyzeFile(p, ["origin-read"]);
    expect(matches.length).toBe(1);
  });

  it("ignores other property reads", () => {
    const p = withFixture("origin3.js", `
      const href = event.currentTarget.href;
      const data = event.data;
      console.log(data);
    `);
    expect(analyzeFile(p, ["origin-read"]).length).toBe(0);
  });
});
