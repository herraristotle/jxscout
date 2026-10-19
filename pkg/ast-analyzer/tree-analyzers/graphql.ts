import { AnalyzerMatch, AnalyzerParams } from "../types";
import { Visitor } from "../walker";

// This regex matches the start of GraphQL queries and mutations
// It allows:
// - Queries starting with 'query' or 'mutation'
// - Optional operation names
// - Leading whitespace
const GRAPHQL_REGEX =
  /(query|mutation|type|fragment|subscription|directive|input|enum|interface|union|scalar|object|list|nonnull)/;

// Decode JavaScript string escapes
function decodeStringEscapes(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Checks if a string is a valid GraphQL operation
function isValidGraphQLOperation(str: string): boolean {
  // Basic validation of GraphQL structure
  const trimmed = str.trim();

  // Must start with query or mutation
  if (
    !trimmed.startsWith("query") &&
    !trimmed.startsWith("mutation") &&
    !trimmed.startsWith("type") &&
    !trimmed.startsWith("fragment") &&
    !trimmed.startsWith("subscription") &&
    !trimmed.startsWith("input") &&
    !trimmed.startsWith("enum") &&
    !trimmed.startsWith("interface") &&
    !trimmed.startsWith("union") &&
    !trimmed.startsWith("scalar") &&
    !trimmed.startsWith("object") &&
    !trimmed.startsWith("list") &&
    !trimmed.startsWith("nonnull")
  ) {
    return false;
  }

  // Must contain at least one field selection
  if (!trimmed.includes("}") || !trimmed.match(/(?<!\$){/)) {
    return false;
  }

  // Check for balanced braces
  let braceCount = 0;
  for (const char of trimmed) {
    if (char === "{") braceCount++;
    if (char === "}") braceCount--;
    if (braceCount < 0) {
      return false;
    }
  }

  if (braceCount !== 0) {
    return false;
  }

  return trimmed.includes("{") && trimmed.includes("}");
}

export const GRAPHQL_ANALYZER_NAME = "graphql";

const graphqlAnalyzerBuilder = (
  args: AnalyzerParams,
  matchesReturn: AnalyzerMatch[]
): Visitor => {
  return {
    Literal(node, ancestors) {
      if (!node.loc || typeof node.value !== "string") {
        return;
      }

      // Decode string escapes before validation
      const decodedValue = decodeStringEscapes(node.value);

      if (!isValidGraphQLOperation(decodedValue)) {
        return;
      }

      if (GRAPHQL_REGEX.test(decodedValue)) {
        const match: AnalyzerMatch = {
          filePath: args.filePath,
          analyzerName: GRAPHQL_ANALYZER_NAME,
          value: node.value, // Keep original value for reference
          start: node.loc.start,
          end: node.loc.end,
          tags: {
            graphql: true,
          },
        };

        let typeFound = false;
        if (decodedValue.includes("query")) {
          match.tags["graphql-query"] = true;
          typeFound = true;
        }

        if (decodedValue.includes("mutation")) {
          match.tags["graphql-mutation"] = true;
          typeFound = true;
        }

        if (!typeFound) {
          match.tags["graphql-other"] = true;
        }

        matchesReturn.push(match);
      }
    },
    TemplateLiteral(node, ancestors) {
      if (!node.loc) {
        return;
      }

      const rawValue = args.source
        .slice(node.start, node.end)
        .replaceAll("`", "");

      // Decode string escapes
      const decodedValue = decodeStringEscapes(rawValue);

      if (!isValidGraphQLOperation(decodedValue)) {
        return;
      }

      if (GRAPHQL_REGEX.test(decodedValue)) {
        const match: AnalyzerMatch = {
          filePath: args.filePath,
          analyzerName: GRAPHQL_ANALYZER_NAME,
          value: rawValue, // Keep original value
          start: node.loc.start,
          end: node.loc.end,
          tags: {
            graphql: true,
          },
        };

        if (decodedValue.includes("query")) {
          match.tags["graphql-query"] = true;
        }

        if (decodedValue.includes("mutation")) {
          match.tags["graphql-mutation"] = true;
        }

        matchesReturn.push(match);
      }
    },
  };
};

export { graphqlAnalyzerBuilder };
