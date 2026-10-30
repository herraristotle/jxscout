// Deterministic filename-based classification of JS assets into vendor / app
// / inline. Ported from jsrip (core/classifier.py) — vendor = bundled
// third-party library code, app = first-party application code worth deeper
// inspection, inline = scripts inlined into HTML. No content scanning.

export type FileCategory = "vendor" | "app" | "inline";

// Filename prefixes that are bundler/manifest artifacts, not app code.
// NOTE: compared against the lowercased filename, so keep these lowercase.
const VENDOR_FILENAME_PREFIXES = [
  "polyfills",
  "runtime",
  "framework",
  "webpack",
  "react-dom",
  "vendor",
  "chunk",
  "main-app",
  "pages-",
  "_app-",
  "_buildmanifest",
  "_ssgmanifest",
];

const VENDOR_NAME_RE =
  /^(es-module-shims|core-js|regenerator|lodash|moment|jquery|swiper|primeng|primeicons|angular|react|vue|ember|rxjs|zone\.?js|tslib|axios|d3|three|chart|highcharts|leaflet|mapbox)(?:[-_.@]|$)/i;

const NODE_MODULES_RE = /node_modules_/i;

// Webpack chunk naming quirks:
//   123-0abcd123.js     numeric id + content hash
//   0abcd1234.js        long hex hash name
//   0abcd12-1fabcde3.js hex-hex chunk id
const HASH_CHUNK_RE = /^\d{3,5}[-. ][0-9a-f]{8,}\.js$/i;
const PURE_HASH_RE = /^[0-9a-f]{8,}\.js$/i;
const HEX_HEX_CHUNK_RE = /^[0-9a-f]{6,}[-. ][0-9a-f]{6,}\.js$/i;

const INLINE_RE = /^inline_/i;

export function classifyFileName(filePath: string): FileCategory {
  const name = filePath.replace(/\\/g, "/").split("/").pop() || "";

  if (INLINE_RE.test(name)) return "inline";

  const lower = name.toLowerCase();
  for (const prefix of VENDOR_FILENAME_PREFIXES) {
    if (lower.startsWith(prefix)) return "vendor";
  }

  if (NODE_MODULES_RE.test(name)) return "vendor";
  if (VENDOR_NAME_RE.test(name)) return "vendor";
  if (HASH_CHUNK_RE.test(name) || PURE_HASH_RE.test(name) || HEX_HEX_CHUNK_RE.test(name)) {
    return "vendor";
  }

  // Everything else is someone's code — including reversed-sourcemap
  // source paths like webpack://app/main.js or src/components/Foo.tsx.
  return "app";
}
