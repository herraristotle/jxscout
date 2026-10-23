import { Program } from "acorn";
import { parse } from "acorn-loose";
import { is, traverse } from "estree-toolkit";
import Sval from "sval";
import {
  getViteChunks,
  getNextJsChunks,
  findChunkFilenameFunction,
  getTurbopackChunks,
  getGoogleLazyChunks,
  identifyChunkLoadingFunctionAndExpression,
} from "./fingerprinting";
import { getChunkFunctionCode } from "./transformer";

export const discoverChunks = (
  code: string,
  bruteforceLimit: number,
  discoverGoogleLazyChunks?: boolean
): string[] => {
  let sourceType: "module" | "script" = "script";
  let ast: Program;

  try {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
    sourceType = "module";
  } catch (err) {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
    });
  }

  // Cheap string pre-checks: a full estree traverse costs seconds on multi-MB
  // bundles, so skip fingerprint passes whose marker is not in the source.
  // Turbopack discovery (highest priority)
  if (code.includes("TURBOPACK") || code.includes("turbopack")) {
    const turbopackChunks = getTurbopackChunks(ast);
    if (turbopackChunks.length !== 0) {
      return turbopackChunks;
    }
  }

  // Google lazy chunks (if enabled)
  if (discoverGoogleLazyChunks && code.includes("lazyChunk")) {
    const googleChunks = getGoogleLazyChunks(ast);
    if (googleChunks.length !== 0) {
      return googleChunks;
    }
  }

  if (code.includes("__BUILD_MANIFEST") || code.includes("__SSG_MANIFEST")) {
    const nextJsChunks = nextJsChunkDiscovery(ast);
    if (nextJsChunks.length !== 0) {
      return nextJsChunks;
    }
  }

  const webpackChunks =
    code.includes("Loading chunk ") ||
    code.includes("__webpack_require__.u")
      ? webpackCunkDiscovery(ast, sourceType, bruteforceLimit)
      : [];
  if (webpackChunks.length !== 0) {
    return webpackChunks;
  }

  if (!code.includes("__vite__mapDeps")) {
    return [];
  }

  return viteChunkDiscovery(ast, sourceType, bruteforceLimit);
};

const viteChunkDiscovery = (
  ast: Program,
  sourceType: "module" | "script",
  bruteforceLimit: number
): string[] => {
  const chunks = new Set(getViteChunks(ast));

  return [...chunks];
};

const nextJsChunkDiscovery = (ast: Program): string[] => {
  const chunks = new Set(getNextJsChunks(ast));
  return [...chunks];
};

const webpackCunkDiscovery = (
  ast: Program,
  sourceType: "module" | "script",
  bruteforceLimit: number
): string[] => {
  // Normal path: the "Loading chunk " error handler gives both the chunk
  // function and the expression building the URL.
  let chunkFunctionContext = identifyChunkLoadingFunctionAndExpression(ast);

  let chunkFunctionCode: string | undefined;
  if (chunkFunctionContext) {
    chunkFunctionCode = getChunkFunctionCode(chunkFunctionContext, ast);
  }

  // Fallback: entry bundles that contain only the webpack runtime
  // (`__webpack_require__.u`), with no error handler string.
  if (!chunkFunctionCode) {
    const filenameContext = findChunkFilenameFunction(ast);
    if (!filenameContext) {
      return [];
    }
    chunkFunctionCode = getChunkFunctionCode(filenameContext, ast);
  }

  if (!chunkFunctionCode) {
    return [];
  }

  const parsedFunction = parse(chunkFunctionCode, {
    ecmaVersion: "latest",
    sourceType: sourceType,
  });

  const possibleParams = getChunkFunctionPossibleParams(
    parsedFunction,
    bruteforceLimit
  );

  return getPossibleChunks(chunkFunctionCode, possibleParams);
};

const getPossibleChunks = (
  functionCode: string,
  possibleParams: any[]
): string[] => {
  const sval = new Sval({
    ecmaVer: "latest",
    sourceType: "script",
  });

  const chunks = new Set<string>();

  if (possibleParams.length === 0) {
    possibleParams.push(0); // add a dummy param in case it's an hardcoded string
  }

  for (let param of possibleParams) {
    if (typeof param === "string") {
      param = `"${param}"`;
    }

    sval.run(`exports.res = (${functionCode})(${param})`);
    const chunk = sval.exports.res;

    // not the best check but make sure there were no concats with undefined
    if (typeof chunk === "string" && !chunk.includes("undefined")) {
      chunks.add(chunk);
    }
  }

  return [...chunks];
};

const getChunkFunctionPossibleParams = (
  parsedFunction: Program,
  bruteforceLimit: number
): any[] => {
  const params: Set<any> = new Set();
  let shouldBruteForce = false;

  traverse(parsedFunction, {
    Literal(path) {
      if (!path.node) {
        return;
      }

      // if it's used as the key of an object, let's consider it
      if (is.property(path.parent) && path.parent.key === path.node) {
        params.add(path.node.value);
      }

      // if it's not part of the concat for string building, let's consider it
      if (is.binaryExpression(path.parent) && path.parent.operator !== "+") {
        params.add(path.node.value);
      }
    },
    Identifier(path) {
      if (!path.node) {
        return;
      }

      // if it's used as the key of an object, let's consider it
      if (is.property(path.parent) && path.parent.key === path.node) {
        params.add(path.node.name);
      }

      if (is.binaryExpression(path.parent) && path.parent.operator === "+") {
        shouldBruteForce = true;
      }
    },
    LogicalExpression(path) {
      if (!path.node) {
        return;
      }

      const left = path.get("left");
      const right = path.get("right");

      if (
        (is.memberExpression(left) && is.identifier(right)) ||
        (is.memberExpression(right) && is.identifier(left))
      ) {
        shouldBruteForce = true;
      }
    },
  });

  if (shouldBruteForce) {
    for (let i = 0; i < bruteforceLimit; i++) {
      params.add(i);
    }
  }

  return [...params];
};
