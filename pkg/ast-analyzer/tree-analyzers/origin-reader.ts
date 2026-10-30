import { AnalyzerMatch, AnalyzerParams } from "../types";
import { Visitor } from "../walker";

// Detects reads of `<x>.origin` (member access to `origin`), used for the
// file-level postMessage origin-risk correlation: postMessage activity
// without any origin read in the same file is flagged.

export const ORIGIN_READ_ANALYZER_NAME = "origin-read";

const originReadAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => ({
  MemberExpression(node, ancestors) {
    if (!node.loc) return;
    if (
      (node as any).property?.type === "Identifier" &&
      (node as any).property!.name === "origin" &&
      !(node as any).computed
    ) {
      const match: AnalyzerMatch = {
        filePath: args.filePath,
        analyzerName: ORIGIN_READ_ANALYZER_NAME,
        value: args.source.slice(node.start, node.end),
        start: node.loc.start,
        end: node.loc.end,
        tags: { "origin-read": true },
      };
      matchesReturn.push(match);
    }
  },
});

export { originReadAnalyzerBuilder };
