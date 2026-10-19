import { AnalyzerMatch, AnalyzerParams } from "../types";
import { Position } from "acorn";

export type DependencyConfusionAnalyzer = ReturnType<
  typeof dependencyConfusionAnalyzerBuilder
>;

export const dependencyConfusionAnalyzerBuilder = (
  args: AnalyzerParams,
  results: AnalyzerMatch[]
) => {
  return {
    // Match: import foo from "package-name"
    // Match: require("package-name")
    // Match: import("package-name")
    ImportDeclaration(node: any) {
      if (!node.source || typeof node.source.value !== "string") {
        return;
      }

      const pkg = node.source.value;

      // Skip relative/absolute paths
      if (pkg.startsWith(".") || pkg.startsWith("/")) {
        return;
      }

      // Skip built-ins (node:*, bun:*)
      if (pkg.startsWith("node:") || pkg.startsWith("bun:")) {
        return;
      }

      // Skip common CDN/URL imports
      if (pkg.startsWith("http://") || pkg.startsWith("https://")) {
        return;
      }

      // Extract package name (handle scoped packages like @org/pkg)
      let packageName = pkg;
      if (pkg.startsWith("@")) {
        const parts = pkg.split("/");
        if (parts.length >= 2) {
          packageName = `${parts[0]}/${parts[1]}`;
        }
      } else {
        packageName = pkg.split("/")[0];
      }

      const match: AnalyzerMatch = {
        filePath: args.filePath,
        analyzerName: "dependency-confusion",
        value: packageName,
        start: { line: node.loc?.start?.line ?? 0, column: node.loc?.start?.column ?? 0 },
        end: { line: node.loc?.end?.line ?? 0, column: node.loc?.end?.column ?? 0 },
        tags: {
          "dependency-confusion": true,
        },
      };

      results.push(match);
    },

    // Match: require("package")
    CallExpression(node: any, ancestors: any[]) {
      if (
        node.callee?.type === "Identifier" &&
        (node.callee.name === "require" || node.callee.name === "import")
      ) {
        if (!node.arguments?.[0] || node.arguments[0].type !== "StringLiteral") {
          return;
        }

        const pkg = node.arguments[0].value;

        // Skip relative/absolute paths
        if (pkg.startsWith(".") || pkg.startsWith("/")) {
          return;
        }

        // Skip built-ins
        if (pkg.startsWith("node:") || pkg.startsWith("bun:")) {
          return;
        }

        // Skip URLs
        if (pkg.startsWith("http://") || pkg.startsWith("https://")) {
          return;
        }

        // Extract package name
        let packageName = pkg;
        if (pkg.startsWith("@")) {
          const parts = pkg.split("/");
          if (parts.length >= 2) {
            packageName = `${parts[0]}/${parts[1]}`;
          }
        } else {
          packageName = pkg.split("/")[0];
        }

        const match: AnalyzerMatch = {
          filePath: args.filePath,
          analyzerName: "dependency-confusion",
          value: packageName,
          start: { line: node.loc?.start?.line ?? 0, column: node.loc?.start?.column ?? 0 },
          end: { line: node.loc?.end?.line ?? 0, column: node.loc?.end?.column ?? 0 },
          tags: {
            "dependency-confusion": true,
          },
        };

        results.push(match);
      }
    },
  };
};