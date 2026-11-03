import { Node } from "acorn";
import { Analyzer, AnalyzerMatch, AnalyzerParams } from "../types";
import { Visitor } from "../walker";

export const FETCH_ANALYZER_NAME = "fetch";

// Auth header patterns to detect authenticated endpoints
const AUTH_PATTERNS = [
  /authorization/i,
  /bearer/i,
  /cookie/i,
  /x-auth/i,
  /x-api-key/i,
  /api-key/i,
  /token/i,
  /jwt/i,
  /session/i,
  /csrf/i,
  /x-csrf/i,
];

// Check if auth-related strings appear within ±80 chars of the fetch call
function checkAuthContext(source: string, fetchStart: number, fetchEnd: number): boolean {
  const windowSize = 80;
  const contextStart = Math.max(0, fetchStart - windowSize);
  const contextEnd = Math.min(source.length, fetchEnd + windowSize);
  const context = source.slice(contextStart, contextEnd);

  return AUTH_PATTERNS.some(pattern => pattern.test(context));
}

const fetchAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => {
  return {
    CallExpression(node, ancestors) {
      if (!node.loc) {
        return;
      }

      // Check if this is a fetch call
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "fetch" &&
        node.arguments.length >= 1
      ) {
        const likelyAuthed = checkAuthContext(args.source, node.start, node.end);

        const match: AnalyzerMatch = {
          filePath: args.filePath,
          analyzerName: FETCH_ANALYZER_NAME,
          value: args.source.slice(node.start, node.end),
          start: node.loc.start,
          end: node.loc.end,
          tags: {
            "fetch-call": true,
            ...(likelyAuthed && { "likely-authed": true }),
          },
        };

        matchesReturn.push(match);
      }
    },
  };
};

export { fetchAnalyzerBuilder };
