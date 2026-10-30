import { describe, it, expect } from "vitest";
import { classifyFileName, FileCategory } from "./classifier";

// Ported from jsrip's core/classifier.py: deterministic filename-based
// vendor/app/inline classification — vendor = bundled third-party code,
// app = first-party code worth deeper inspection, inline = scripts inlined
// into HTML.

describe("classifyFileName", () => {
  it("classifies vendor prefixes", () => {
    expect(classifyFileName("polyfills-armada.min.js")).toBe("vendor");
    expect(classifyFileName("runtime.0f9a1b.js")).toBe("vendor");
    expect(classifyFileName("framework-2c7f8d.js")).toBe("vendor");
    expect(classifyFileName("webpack-internal.js")).toBe("vendor");
    expect(classifyFileName("vendor.bundle.js")).toBe("vendor");
    expect(classifyFileName("chunk-2d0c.js")).toBe("vendor");
    expect(classifyFileName("main-app.js")).toBe("vendor");
    expect(classifyFileName("_app-4c5de.js")).toBe("vendor");
    expect(classifyFileName("_buildManifest.js")).toBe("vendor");
  });

  it("classifies known library names as vendor", () => {
    expect(classifyFileName("jquery.min.js")).toBe("vendor");
    expect(classifyFileName("angular-core.mjs")).toBe("vendor");
    expect(classifyFileName("react-dom.production.min.js")).toBe("vendor");
    expect(classifyFileName("vue.runtime.js")).toBe("vendor");
    expect(classifyFileName("swiper-bundle.js")).toBe("vendor");
  });

  it("classifies node_modules bundles as vendor", () => {
    expect(classifyFileName("node_modules_axios_index.js")).toBe("vendor");
  });

  it("classifies hashed/content chunks as vendor", () => {
    expect(classifyFileName("123-0abcd123.js")).toBe("vendor");
    expect(classifyFileName("0abcd1234.js")).toBe("vendor");
    expect(classifyFileName("0abcd12-1fabcde3.js")).toBe("vendor");
  });

  it("classifies inline scripts", () => {
    expect(classifyFileName("inline_1.js")).toBe("inline");
    expect(classifyFileName("inline_script_42.js")).toBe("inline");
  });

  it("classifies first-party code as app", () => {
    expect(classifyFileName("main.js")).toBe("app");
    expect(classifyFileName("dashboard.js")).toBe("app");
    expect(classifyFileName("score-board.js")).toBe("app");
    expect(classifyFileName("app.module.js")).toBe("app");
  });

  it("treats reversed sourcemap files as app (real source)", () => {
    expect(classifyFileName("webpack://score-board/main.js")).toBe("app");
    expect(classifyFileName("src/components/Foo.tsx")).toBe("app");
  });

  it("handles full paths (uses basename)", () => {
    expect(classifyFileName("/project/js/vendor/jquery.js")).toBe("vendor");
    expect(classifyFileName("/project/js/main.js")).toBe("app");
  });

  it("exposes FileCategory union", () => {
    const c: FileCategory = "app";
    expect(c).toBe("app");
  });
});
