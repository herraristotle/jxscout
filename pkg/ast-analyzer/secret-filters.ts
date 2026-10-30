// False-positive filter stack for the secrets analyzer.
// Ported from jsrip (core/analyzer.py) — confidence tiers, entropy scoring,
// and multi-layer FP rejection for secret candidates found in string
// literals. All credits to the jsrip authors.

// Common placeholder / dummy values that should be filtered out
const PLACEHOLDER_PATTERNS = new RegExp(
  "^(" +
    "YOUR_?API_?KEY.*|CHANGE_?ME.*|TODO.*|FIXME.*|REPLACE_?ME.*|" +
    "INSERT_?.*_?HERE|PUT_?YOUR_?.*|ENTER_?YOUR_?.*|" +
    "xxx+|XXX+|yyy+|zzz+|aaa+|bbb+|000+|111+|123+|" +
    "test_?key.*|example_?key.*|sample_?key.*|demo_?key.*|fake_?key.*|" +
    "dummy.*|placeholder.*|" +
    "sk_test_.*|pk_test_.*|" +
    "<[A-Z_]+>|" + // <API_KEY> style placeholders
    "\\{\\{.*\\}\\}|" + // {{TEMPLATE}} style
    "\\$\\{.*\\}|" + // ${VARIABLE} style
    "process\\.env\\..*|" +
    "undefined|null|true|false|" +
    "function|return|default|module|exports" +
    ")$",
  "i"
);

// Known safe / non-secret strings
const FALSE_POSITIVE_VALUES = new Set([
  "application/json", "application/xml", "text/html", "text/plain",
  "text/javascript", "application/javascript", "multipart/form-data",
  "application/x-www-form-urlencoded", "charset=utf-8",
  "content-type", "authorization", "accept", "user-agent",
  "no-cache", "no-store", "must-revalidate", "max-age=0",
  "utf-8", "ascii", "latin1", "iso-8859-1",
  "get", "post", "put", "delete", "patch", "options", "head",
  "localhost", "undefined", "null", "true", "false",
  "none", "auto", "inherit", "initial", "unset",
]);

// CSS color hex patterns (6 or 8 digit)
const CSS_HEX_RE = /^#?[0-9a-fA-F]{3,8}$/;

// Version strings like 1.2.3, v2.0.0
const VERSION_RE = /^v?\d+\.\d+\.\d+([-.]\w+)?$/;

// Minified variable names (single letter or very short nonsense)
const MINIFIED_VAR_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]{0,3}$/;

const CAMELCASE_IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// URL path patterns (not secrets)
const URL_PATH_RE = /^\/[a-zA-Z0-9/_.-]+$/;

// Documentation/library URL fragments that are never secrets
const DOC_URL_DOMAINS = [
  "github.com/", "stackoverflow.com", "npmjs.com",
  "docs.google.com", "developer.mozilla.org",
];

// Common JS expression fragments that shouldn't be secret candidates
const JS_EXPRESSION_FRAGMENTS = [
  "function(", "return ", "module.", "require(", "import ",
  ".prototype", ".constructor", "Object.", "Array.",
  ".toString", ".valueOf",
];

// Comment context markers that make a value an example, not a secret
const COMMENT_CONTEXT_MARKERS = [
  "// example", "// test", "// sample", "// demo",
  "/* example", "/* test", "* @param", "* @returns",
  "todo:", "fixme:", "hack:", "note:",
];

// File paths that aren't connection strings
const FILE_PATH_PREFIXES = [
  "/usr/", "/var/", "/etc/", "/home/", "/tmp/",
  "C:\\", "./node_modules/", "../",
];

export type Confidence = "high" | "medium" | "low" | "info";

export function calculateEntropy(value: string): number {
  if (!value) return 0;
  const counts: Record<string, number> = {};
  for (const char of value) {
    counts[char] = (counts[char] || 0) + 1;
  }
  let entropy = 0;
  const len = value.length;
  for (const char in counts) {
    const p = counts[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

export function looksLikeHash(value: string): boolean {
  return /^[A-Fa-f0-9]{32}$/.test(value)
    || /^[A-Fa-f0-9]{40}$/.test(value)
    || /^[A-Fa-f0-9]{64}$/.test(value);
}

const isAlpha = (s: string) => /^[a-zA-Z]+$/.test(s);
const isLower = (s: string) => /^[a-z]+$/.test(s);

export function looksLikeJsIdentifier(value: string): boolean {
  if (!CAMELCASE_IDENT_RE.test(value)) return false;
  const hasUpperTransition = /[a-z][A-Z]/.test(value);
  // Pure alphabetic camelCase with no digits/special chars = likely JS name
  if (hasUpperTransition && isAlpha(value)) return true;
  // PascalCase (starts with upper, has transitions)
  if (value[0] >= "A" && value[0] <= "Z" && hasUpperTransition && isAlpha(value)) {
    return true;
  }
  // Common JS naming: all lowercase with no special chars
  if (isLower(value) && value.length >= 8) return true;
  return false;
}

export function isFalsePositive(
  value: string,
  secretType: string,
  context = ""
): boolean {
  const stripped = value.trim().replace(/^['"]|['"]$/g, "");

  // Too short or too long
  if (stripped.length < 8 || stripped.length > 512) return true;

  // Placeholder / dummy values
  if (PLACEHOLDER_PATTERNS.test(stripped)) return true;

  // Known safe strings
  if (FALSE_POSITIVE_VALUES.has(stripped.toLowerCase())) return true;

  // CSS hex colors
  if (CSS_HEX_RE.test(stripped)) return true;

  // Version strings
  if (VERSION_RE.test(stripped)) return true;

  // Minified variable names
  if (MINIFIED_VAR_RE.test(stripped)) return true;

  // camelCase / PascalCase JS identifiers (function names, class names)
  if (looksLikeJsIdentifier(stripped)) return true;

  // URL paths that are not actual secrets (e.g. /changepassword)
  if (URL_PATH_RE.test(stripped)) return true;

  // Pure numeric (not a key)
  if (/^\d+$/.test(stripped)) return true;

  // Repetitive characters (low entropy junk like "aaaaaaaaaa")
  if (new Set(stripped).size <= 2 && stripped.length >= 8) return true;

  // File paths that aren't connection strings
  if (FILE_PATH_PREFIXES.some((p) => stripped.startsWith(p))) return true;

  // data: URIs
  if (stripped.startsWith("data:")) return true;

  // In a data URI context
  const ctxLower = context.toLowerCase();
  if (ctxLower.includes("data:image") || ctxLower.includes("data:font")) {
    return true;
  }

  // Common JS expressions that match patterns
  const strippedLower = stripped.toLowerCase();
  if (JS_EXPRESSION_FRAGMENTS.some((kw) => strippedLower.includes(kw))) {
    return true;
  }

  // URL-like patterns that are actually documentation
  const typeLower = secretType.toLowerCase();
  const isTokenOrKeyType = typeLower.includes("token") || typeLower.includes("key");
  if (!isTokenOrKeyType && DOC_URL_DOMAINS.some((d) => strippedLower.includes(d))) {
    return true;
  }

  // Comment context detection
  if (COMMENT_CONTEXT_MARKERS.some((marker) => ctxLower.includes(marker))) {
    return true;
  }

  return false;
}

// Secret types whose very format is strong evidence (known prefixes like
// AKIA, sk_live_). For these, medium confidence is available even at
// entropy >= 2.0.
const HIGH_KEYWORDS = [
  "aws_api_key", "stripe_", "github_token", "github_pat",
  "slack_token", "slack_bot", "private_key", "google_api",
  "firebase", "twilio", "sendgrid", "mailgun", "heroku",
  "shopify", "square_", "paypal", "braintree", "npm_token",
  "pypi_token", "rubygems", "nuget", "docker_", "gitlab_",
  "bitbucket_", "jwt_token", "clerk_secret", "azure_",
  "okta_", "cognito_", "url_basic_auth", "webhook_secret",
];

export function assessConfidence(
  secretType: string,
  value: string,
  entropy: number
): Confidence {
  const lowerType = secretType.toLowerCase();

  if (HIGH_KEYWORDS.some((kw) => lowerType.includes(kw))) {
    if (entropy >= 3.0) return "high";
    if (entropy >= 2.0) return "medium";
  }

  // Length-aware entropy thresholds
  const vlen = value.length;
  let highT: number, medT: number, lowT: number;
  if (vlen < 16) {
    [highT, medT, lowT] = [3.8, 3.3, 2.3];
  } else if (vlen > 128) {
    [highT, medT, lowT] = [3.2, 2.7, 1.8];
  } else {
    [highT, medT, lowT] = [3.5, 3.0, 2.0];
  }

  if (entropy >= highT) return "high";
  if (entropy >= medT) return "medium";
  if (entropy >= lowT) return "low";
  return "info";
}
