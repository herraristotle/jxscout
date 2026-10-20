import { parseSync, ParseResult } from "oxc-parser";
import { traverse, is } from "estree-toolkit";
import Sval from "sval";

interface OptimizerResult {
  optimized_content: string;
  changes: number;
}

interface StringInlinerContext {
  constants: Map<string, string>;
}

function createInlinerContext(): StringInlinerContext {
  return { constants: new Map() };
}

function resolveToString(node: any, ctx: StringInlinerContext): string | null {
  if (!node) return null;

  // String literal
  if (node.type === "StringLiteral" || node.type === "Literal") {
    return node.value ?? node.raw;
  }

  // Identifier - lookup in constants
  if (node.type === "Identifier") {
    return ctx.constants.get(node.name) ?? null;
  }

  // Binary expression with + operator (string concatenation)
  if (node.type === "BinaryExpression" && node.operator === "+") {
    const left = resolveToString(node.left, ctx);
    const right = resolveToString(node.right, ctx);
    if (left !== null && right !== null) {
      return left + right;
    }
  }

  // Template literal
  if (node.type === "TemplateLiteral") {
    if (node.expressions && node.expressions.length > 0) {
      let result = "";
      for (let i = 0; i < node.quasis.length; i++) {
        const quasi = node.quasis[i];
        result += quasi.value.cooked ?? quasi.value.raw ?? "";

        if (i < node.expressions.length) {
          const exprValue = resolveToString(node.expressions[i], ctx);
          if (exprValue === null) return null;
          result += exprValue;
        }
      }
      return result;
    } else {
      return node.quasis[0]?.value?.cooked ?? node.quasis[0]?.value?.raw ?? null;
    }
  }

  return null;
}

function trackDeclaration(node: any, ctx: StringInlinerContext): void {
  if (node.type === "VariableDeclaration" || node.type === "VariableDeclarator") {
    for (const decl of node.declarations || [node]) {
      if (decl.id?.type === "Identifier" && decl.init) {
        const value = resolveToString(decl.init, ctx);
        if (value !== null) {
          ctx.constants.set(decl.id.name, value);
        }
      }
    }
  }
}

function tryParseJSON(node: any, ctx: StringInlinerContext): any | null {
  if (
    node.type === "CallExpression" &&
    node.callee?.type === "MemberExpression" &&
    node.callee.object?.type === "Identifier" &&
    node.callee.object.name === "JSON" &&
    node.callee.property?.type === "Identifier" &&
    node.callee.property.name === "parse"
  ) {
    if (node.arguments?.[0]) {
      const jsonStr = resolveToString(node.arguments[0], ctx);
      if (jsonStr !== null) {
        try {
          return JSON.parse(jsonStr);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

type TransformerName = "json_parse" | "variable_inliner" | "string_concat";

const ALL_TRANSFORMERS: TransformerName[] = ["json_parse", "variable_inliner", "string_concat"];

function optimizeCode(
  source: string,
  transformers: Set<string> = new Set(ALL_TRANSFORMERS),
): { content: string; changes: number } {
  const ctx = createInlinerContext();
  let changes = 0;
  const wantInliner = transformers.has("variable_inliner");
  const wantConcat = transformers.has("string_concat");
  const wantJSON = transformers.has("json_parse");

  let parsed: ParseResult;
  try {
    parsed = parseSync("", source, { sourceType: "module", astType: "ts", lang: "tsx" });
  } catch {
    try {
      parsed = parseSync("", source, { sourceType: "script", astType: "ts", lang: "tsx" });
    } catch (e) {
      return { content: source, changes: 0 };
    }
  }

  const lines = source.split("\n");

  // estree-toolkit visitors receive a NodePath; use path.node for the raw AST node.
  // oxc nodes carry char offsets on node.start / node.end.
  const offset = (n: any): { start: number; end: number } | null =>
    typeof n?.start === "number" && typeof n?.end === "number"
      ? { start: n.start, end: n.end }
      : null;

  // First pass: collect constant declarations (needed by inliner and concat)
  if (wantInliner || wantConcat) {
    traverse(parsed.program, {
      VariableDeclaration(path: any) {
        trackDeclaration(path.node, ctx);
      },
    });
  }

  // Second pass: replace identifiers and expressions
  const mutations: Array<{ start: number; end: number; replacement: string }> = [];

  traverse(parsed.program, {
    Identifier(path: any) {
      const node = path.node;
      const parent = path.parentPath?.node;

      // Skip if it's part of a declaration (left-hand side) or function name
      if (parent?.type === "VariableDeclarator" && parent.id === node) return;
      if (parent?.type === "FunctionDeclaration" && parent.id === node) return;
      if (parent?.type === "FunctionExpression" && parent.id === node) return;
      if (parent?.type === "ArrowFunctionExpression" && parent.id === node) return;
      // Skip object property keys and member property names (non-computed)
      if (parent?.type === "MemberExpression" && parent.property === node && !parent.computed) return;
      if ((parent?.type === "Property" || parent?.type === "PropertyDefinition") && parent.key === node && !parent.computed) return;

      if (!wantInliner) return;
      const value = ctx.constants.get(node.name);
      const range = offset(node);
      if (value != null && range) {
        mutations.push({
          start: range.start,
          end: range.end,
          replacement: JSON.stringify(value),
        });
        changes++;
      }
    },
    BinaryExpression(path: any) {
      if (!wantConcat) return;
      const node = path.node;
      const range = offset(node);
      if (node.operator === "+" && range) {
        const value = resolveToString(node, ctx);
        if (value !== null) {
          mutations.push({
            start: range.start,
            end: range.end,
            replacement: JSON.stringify(value),
          });
          changes++;
        }
      }
    },
    CallExpression(path: any) {
      if (!wantJSON) return;
      const node = path.node;
      const range = offset(node);
      if (tryParseJSON(node, ctx) !== null && range) {
        const jsonResult = tryParseJSON(node, ctx);
        if (jsonResult !== null) {
          mutations.push({
            start: range.start,
            end: range.end,
            replacement: JSON.stringify(jsonResult),
          });
          changes++;
        }
      }
    },
  });

  // Drop nested/overlapping mutations (prefer outer, larger ranges) and
  // apply in reverse order to preserve positions.
  mutations.sort((a, b) => a.start - b.start || b.end - a.end);
  const applicable: typeof mutations = [];
  let lastEnd = -1;
  for (const mut of mutations) {
    if (mut.start >= lastEnd) {
      applicable.push(mut);
      lastEnd = mut.end;
    }
  }
  applicable.sort((a, b) => b.start - a.start);

  let optimized = source;
  for (const mut of applicable) {
    optimized = optimized.slice(0, mut.start) + mut.replacement + optimized.slice(mut.end);
  }

  return { content: optimized, changes };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: optimizer.ts <filepath> [transformers_csv] [iterations]");
    process.exit(1);
  }

  const filePath = args[0];
  // transformers: comma list or env; default = all three (json_parse, variable_inliner, string_concat)
  const transformersArg = args[1] || process.env.OPTIMIZER_TRANSFORMERS || ALL_TRANSFORMERS.join(",");
  const transformers = new Set(
    transformersArg.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
  );
  const iterations = Math.max(1, parseInt(args[2] || process.env.OPTIMIZER_ITERATIONS || "1", 10) || 1);

  const fs = require("fs");
  let source = fs.readFileSync(filePath, "utf-8");
  let totalChanges = 0;

  // Pro v2 beautifier.transformations.iterations: re-run until stable or cap reached
  for (let i = 0; i < iterations; i++) {
    const result = optimizeCode(source, transformers);
    totalChanges += result.changes;
    if (result.changes === 0) break;
    source = result.content;
  }

  console.log(JSON.stringify({
    optimized_content: source,
    changes: totalChanges,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeCode };