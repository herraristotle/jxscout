import { AnalyzerMatch, AnalyzerParams } from "../types";
import { Visitor } from "../walker";

// debug-flags (ported from jsrip inspector.py): exposed debug/feature-flag
// state in client code — { DEBUG: true }, { isDev: true }, featureFlags,
// __DEV__ references. Client-side flags are advisory; each is a candidate
// to force in the browser to unlock hidden behavior.

export const DEBUG_FLAGS_ANALYZER_NAME = "debug-flags";

const FLAG_TRUE_NAMES = new Set(["debug", "isdev", "isdevmode", "devmode"]);

const debugFlagsAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  Property(node, ancestors) {
    if (!node.loc) return;
    const key = (node as any).key;
    const name =
      key?.type === "Identifier"
        ? key.name
        : key?.type === "Literal" && typeof key.value === "string"
          ? key.value
          : null;
    if (!name || !FLAG_TRUE_NAMES.has(name.toLowerCase())) return;

    const value = (node as any).value;
    if (value?.type !== "Literal" || value.value !== true) return;

    matchesReturn.push({
      filePath: args.filePath,
      analyzerName: DEBUG_FLAGS_ANALYZER_NAME,
      value: args.source.slice(node.start, node.end),
      start: node.loc.start,
      end: node.loc.end,
      tags: { "debug-flag": true },
    });
  },

  Identifier(node, ancestors) {
    if (!node.loc) return;
    if ((node as any).name !== "__DEV__") return;

    matchesReturn.push({
      filePath: args.filePath,
      analyzerName: DEBUG_FLAGS_ANALYZER_NAME,
      value: args.source.slice(node.start, node.end),
      start: node.loc.start,
      end: node.loc.end,
      tags: { "debug-flag": true, "debug-flag-dev": true },
    });
  },
});

export { debugFlagsAnalyzerBuilder };
