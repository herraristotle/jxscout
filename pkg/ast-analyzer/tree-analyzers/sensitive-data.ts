import { Analyzer, AnalyzerMatch, AnalyzerParams } from "../types";
import { Visitor } from "../walker";
import { calculateEntropy } from "../secret-filters";

// Structural secret detectors ported from jsrip (core/analyzer.py):
// - sensitive-assignment: const/let/var assignment to a sensitive-named
//   identifier with a string value
// - config-object: object literal property with a credential-ish name
// - env-fallback: process.env.X || "hardcoded" (high) and bare
//   process.env.SENSITIVE (info)
// - auth-header: object property Authorization/X-API-Key/... with a
//   hardcoded string value
// True AST matches, so they beat jsrip's regex equivalents for precision.

export const SENSITIVE_ASSIGNMENT_ANALYZER_NAME = "sensitive-assignment";
export const CONFIG_OBJECT_ANALYZER_NAME = "config-object";
export const ENV_FALLBACK_ANALYZER_NAME = "env-fallback";
export const AUTH_HEADER_ANALYZER_NAME = "auth-header";

// Sensitive variable/property names that indicate secrets when assigned
// string values (jsrip's SENSITIVE_VAR_NAMES).
const SENSITIVE_NAMES_RE =
  /(?:api[_-]?key|api[_-]?secret|auth[_-]?token|access[_-]?token|secret[_-]?key|private[_-]?key|client[_-]?secret|password|passwd|pwd|token|credentials?|aws[_-]?(?:key|secret|token)|stripe[_-]?(?:key|secret)|database[_-]?(?:url|password|uri)|encryption[_-]?key|signing[_-]?(?:key|secret)|webhook[_-]?(?:secret|url)|smtp[_-]?(?:password|pass)|app[_-]?secret|session[_-]?secret|jwt[_-]?secret)/i;

const SENSITIVE_ENV_KEYWORDS = [
  "KEY", "SECRET", "TOKEN", "PASSWORD", "CREDENTIAL", "AUTH",
  "PRIVATE", "API", "DATABASE", "DB_", "STRIPE", "AWS", "REDIS",
  "MONGO", "SMTP",
];

const AUTH_HEADER_NAMES = new Set([
  "Authorization", "X-API-Key", "X-Auth-Token", "X-Access-Token",
]);

const isIdentifier = (name: string): boolean => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
const propertyName = (key: any): string | null => {
  if (!key) return null;
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
};

function makeMatch(
  args: AnalyzerParams,
  analyzerName: string,
  node: any,
  tags: Record<string, true>,
  extra?: Record<string, any>
): AnalyzerMatch {
  return {
    filePath: args.filePath,
    analyzerName,
    value: args.source.slice(node.start, node.end),
    start: node.loc!.start,
    end: node.loc!.end,
    tags,
    extra,
  };
}

const sensitiveAssignmentAnalyzer = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  VariableDeclarator(node: any, ancestors) {
    if (!node.loc || !node.id || node.id.type !== "Identifier") return;
    const name = node.id.name;
    if (!SENSITIVE_NAMES_RE.test(name)) return;
    if (node.init?.type !== "Literal" || typeof node.init.value !== "string") return;
    const value: string = node.init.value;
    if (value.length < 8 || value.length > 256) return;
    const entropy = calculateEntropy(value);
    // jsrip requires entropy >= 2.0 for assignments
    if (entropy < 2.0) return;
    matchesReturn.push(
      makeMatch(args, SENSITIVE_ASSIGNMENT_ANALYZER_NAME, node, {
        "sensitive-assignment": true,
      }, {
        confidence: entropy >= 3.5 ? "high" : entropy >= 2.5 ? "medium" : "low",
        entropy,
        variable: name,
      })
    );
  },
});

const configObjectAnalyzer = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  Property(node: any, ancestors) {
    if (!node.loc) return;
    const name = propertyName(node.key);
    if (!name || !isIdentifier(name)) return;
    if (!SENSITIVE_NAMES_RE.test(name)) return;
    if (node.value?.type !== "Literal" || typeof node.value.value !== "string") return;
    const value: string = node.value.value;
    if (value.length < 8 || value.length > 256) return;
    const entropy = calculateEntropy(value);
    // jsrip requires entropy >= 2.5 for config objects
    if (entropy < 2.5) return;
    matchesReturn.push(
      makeMatch(args, CONFIG_OBJECT_ANALYZER_NAME, node, { "config-object": true }, {
        confidence: entropy >= 3.5 ? "high" : "medium",
        entropy,
        property: name,
      })
    );
  },
});

const envFallbackAnalyzer = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  LogicalExpression(node: any, ancestors) {
    if (!node.loc || node.operator !== "||") return;
    // Left side must be process.env.X (MemberExpression over MemberExpression)
    if (node.left?.type !== "MemberExpression") return;
    const left = node.left;
    if (
      left.object?.type !== "MemberExpression" ||
      left.object.object?.name !== "process" ||
      left.object.property?.name !== "env" ||
      left.property?.type !== "Identifier"
    ) {
      return;
    }
    const envVar: string = left.property.name;
    if (!SENSITIVE_ENV_KEYWORDS.some((kw) => envVar.toUpperCase().includes(kw))) {
      return;
    }
    if (node.right?.type === "Literal" && typeof node.right.value === "string") {
      const value: string = node.right.value;
      if (value.length < 8 || value.length > 256) return;
      const entropy = calculateEntropy(value);
      matchesReturn.push(
        makeMatch(args, ENV_FALLBACK_ANALYZER_NAME, node, { "env-fallback": true }, {
          confidence: entropy >= 3.5 ? "high" : "medium",
          entropy,
          envVar,
        })
      );
    }
  },
  CallExpression(node: any, ancestors) {
    if (!node.loc) return;
    // Bare reference: const x = process.env.SECRET_KEY  (VariableDeclarator
    // init is a MemberExpression, not a call). We hook MemberExpression-level
    // detection here through the declarator path instead; see below.
  },
  VariableDeclarator(node: any, ancestors) {
    if (!node.loc || !node.id) return;
    const init = node.init;
    if (!init) return;
    // Detect: process.env.SENSITIVE_X (bare reference, no fallback)
    let member: any = init;
    if (
      member?.type === "MemberExpression" &&
      member.object?.type === "MemberExpression" &&
      member.object.object?.name === "process" &&
      member.object.property?.name === "env" &&
      member.property?.type === "Identifier"
    ) {
      const envVar: string = member.property.name;
      if (!SENSITIVE_ENV_KEYWORDS.some((kw) => envVar.toUpperCase().includes(kw))) {
        return;
      }
      matchesReturn.push(
        makeMatch(args, ENV_FALLBACK_ANALYZER_NAME, node, { "env-reference": true }, {
          confidence: "info",
          entropy: 0,
          envVar,
        })
      );
    }
  },
});

const authHeaderAnalyzer = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  Property(node: any, ancestors) {
    if (!node.loc) return;
    const name = propertyName(node.key);
    if (!name || !AUTH_HEADER_NAMES.has(name)) return;
    if (node.value?.type !== "Literal" || typeof node.value.value !== "string") return;
    const value: string = node.value.value;
    if (value.length < 8 || value.length > 256) return;
    const entropy = calculateEntropy(value);
    // Skip placeholders — a bare "Bearer " prefix alone is not a secret
    if (/^Bearer\s*$/i.test(value.trim())) return;
    matchesReturn.push(
      makeMatch(args, AUTH_HEADER_ANALYZER_NAME, node, { "auth-header": true }, {
        confidence: entropy >= 3.5 ? "high" : "medium",
        entropy,
        header: name,
      })
    );
  },
});

const sensitiveAssignmentAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => sensitiveAssignmentAnalyzer(args, matchesReturn);

const configObjectAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => configObjectAnalyzer(args, matchesReturn);

const envFallbackAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => envFallbackAnalyzer(args, matchesReturn);

const authHeaderAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => authHeaderAnalyzer(args, matchesReturn);

export {
  sensitiveAssignmentAnalyzerBuilder,
  configObjectAnalyzerBuilder,
  envFallbackAnalyzerBuilder,
  authHeaderAnalyzerBuilder,
};
