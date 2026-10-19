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

function optimizeCode(source: string): { content: string; changes: number } {
  const ctx = createInlinerContext();
  let changes = 0;

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

  // First pass: collect constant declarations
  traverse(parsed.program, {
    VariableDeclaration(node) {
      trackDeclaration(node, ctx);
    },
    VariableDeclarator(node) {
      trackDeclaration(node, ctx);
    },
  });

  // Second pass: replace identifiers and expressions
  const mutations: Array<{ start: number; end: number; replacement: string }> = [];

  traverse(parsed.program, {
    Identifier(node) {
      // Skip if it's part of a declaration (left-hand side)
      if (node.parent?.type === "VariableDeclarator" && node.parent.id === node) return;
      if (node.parent?.type === "FunctionDeclaration" && node.parent.id === node) return;
      if (node.parent?.type === "FunctionExpression" && node.parent.id === node) return;
      if (node.parent?.type === "ArrowFunctionExpression" && node.parent.id === node) return;

      const value = ctx.constants.get(node.name);
      if (value !== null && node.loc) {
        mutations.push({
          start: node.loc.start,
          end: node.loc.end,
          replacement: JSON.stringify(value),
        });
        changes++;
      }
    },
    BinaryExpression(node) {
      if (node.operator === "+" && node.loc) {
        const value = resolveToString(node, ctx);
        if (value !== null) {
          mutations.push({
            start: node.loc.start,
            end: node.loc.end,
            replacement: JSON.stringify(value),
          });
          changes++;
        }
      }
    },
    CallExpression(node) {
      // JSON.parse evaluation
      if (tryParseJSON(node, ctx) !== null && node.loc) {
        const jsonResult = tryParseJSON(node, ctx);
        if (jsonResult !== null) {
          mutations.push({
            start: node.loc.start,
            end: node.loc.end,
            replacement: JSON.stringify(jsonResult),
          });
          changes++;
        }
      }
    },
  });

  // Apply mutations in reverse order to preserve positions
  mutations.sort((a, b) => b.start - a.start);

  let optimized = source;
  for (const mut of mutations) {
    optimized = optimized.slice(0, mut.start) + mut.replacement + optimized.slice(mut.end);
  }

  return { content: optimized, changes };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: optimizer.ts <filepath>");
    process.exit(1);
  }

  const filePath = args[0];
  const source = require("fs").readFileSync(filePath, "utf-8");
  const result = optimizeCode(source);

  console.log(JSON.stringify({
    optimized_content: result.content,
    changes: result.changes,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeCode };