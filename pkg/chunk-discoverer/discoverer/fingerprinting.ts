import { Program } from "acorn";
import { is, NodePath, traverse } from "estree-toolkit";
import {
  AssignmentExpression,
  Expression,
  Function,
  FunctionDeclaration,
  Identifier,
  Node,
  VariableDeclarator,
} from "estree-toolkit/dist/generated/types";

const LOADING_CHUNK_FINGERPRINT = "Loading chunk ";
const VITE_MAP_DEPS_FINGERPRINT = "__vite__mapDeps";
const NEXTJS_BUILD_MANIFEST_FINGERPRINT = "__BUILD_MANIFEST";
const NEXTJS_SSG_MANIFEST_FINGERPRINT = "__SSG_MANIFEST";
// Turbopack
const TURBOPACK_CHUNK_FINGERPRINT = "turbopack";
const TURBOPACK_LOADING = "turbopackLoading";
// Google lazy-loaded chunks
const GOOGLE_CHUNK_FINGERPRINT = "google.chunk";
const GOOGLE_LAZY_CHUNK_FINGERPRINT = "lazyChunk";

export interface ChunkLoadingFingerprintContext {
  functionContext: ChunkLoadingFunctionContext;
  expressionContext: ChunkBuilderExpressionContext;
}

export const identifyChunkLoadingFunctionAndExpression = (
  ast: Program
): ChunkLoadingFingerprintContext | undefined => {
  const chunkLoadingFunctionContext = findChunkLoadingFunction(ast);
  if (!chunkLoadingFunctionContext) {
    return;
  }

  const chunkBuilderExpression = findChunkBuilderExpression(
    chunkLoadingFunctionContext
  );
  if (!chunkBuilderExpression) {
    return;
  }

  return {
    functionContext: chunkLoadingFunctionContext,
    expressionContext: chunkBuilderExpression,
  };
};

interface ChunkLoadingFunctionContext {
  function: NodePath<Function>;
  chunkIdParam: NodePath<Identifier>;
}

const findChunkLoadingFunction = (
  ast: Program
): ChunkLoadingFunctionContext | undefined => {
  let context: ChunkLoadingFunctionContext | undefined;

  traverse(ast, {
    Literal(path) {
      if (path.node?.value !== LOADING_CHUNK_FINGERPRINT) {
        return;
      }

      let func: NodePath<Function> | null | undefined = path
        .getFunctionParent()
        ?.getFunctionParent(); // assuming the target function is the parent of the error handling function

      if (
        !is.assignmentExpression(func?.getOpposite()?.parentPath) &&
        !is.variableDeclarator(func?.parentPath)
      ) {
        return this.stop();
      }

      if (!func) {
        return this.stop();
      }

      const funcParams = func.get("params");

      // the function should have at least one param (chunkID)
      if (funcParams.length < 1) {
        return this.stop();
      }

      const chunkIdParam = funcParams[0];
      if (!is.identifier(chunkIdParam)) {
        return this.stop();
      }

      context = {
        function: func,
        chunkIdParam: chunkIdParam,
      };

      this.stop();
    },
  });

  return context;
};

interface ChunkBuilderExpressionContext {
  expression: NodePath<Expression> | undefined;
}

const findChunkBuilderExpression = (
  context: ChunkLoadingFunctionContext
): ChunkBuilderExpressionContext | undefined => {
  let chunkBuilderExpression: ChunkBuilderExpressionContext | undefined;

  // the chunk builder expression usually is within the context of a assignment (e.g. d.src = s(t)) or
  // variable declaration (var i = s(t)). let's look for those two places
  context.function.traverse({
    AssignmentExpression(path) {
      const right = path.get("right");

      if (
        matchesBinaryExpressionFingerprint(context, right) ||
        matchesCallExpressionFingerprint(context, right)
      ) {
        chunkBuilderExpression = {
          expression: right,
        };
        this.stop();
      }
    },
    VariableDeclarator(path) {
      const right: NodePath<Expression, VariableDeclarator> = path.get("init");

      if (
        matchesBinaryExpressionFingerprint(context, right) ||
        matchesCallExpressionFingerprint(context, right)
      ) {
        chunkBuilderExpression = {
          expression: right,
        };
        this.stop();
      }
    },
  });

  return chunkBuilderExpression;
};

const matchesBinaryExpressionFingerprint = (
  context: ChunkLoadingFunctionContext,
  expression: NodePath<Expression>
): boolean => {
  if (!is.binaryExpression(expression)) {
    return false;
  }

  const hasPlusOperator = expression.node?.operator === "+";
  if (!hasPlusOperator) {
    return false;
  }

  let hasCallWithChunkID = false;

  expression.traverse({
    CallExpression(path) {
      if (matchesCallExpressionFingerprint(context, path)) {
        hasCallWithChunkID = true;
        this.stop();
      }
    },
  });

  if (hasCallWithChunkID) {
    return true;
  }

  // if we don't have a function call here with chunkID, most likely the expression is inlined
  // so there will be two indicators for this scenario:
  // 1. the chunkID argument is used somewhere in the expression
  // 2. there is a literal somewhere that includes ".js"

  let hasChunkIDIdentifier = false;
  let hasJSLiteral = false;

  expression.traverse({
    Identifier(path) {
      if (path.node && path.node?.name === context.chunkIdParam.node?.name) {
        hasChunkIDIdentifier = true;
      }
    },
    Literal(path) {
      if (
        typeof path.node?.value === "string" &&
        path.node.value.includes(".js")
      ) {
        hasJSLiteral = true;
      }
    },
  });

  return hasJSLiteral && hasChunkIDIdentifier;
};

const matchesCallExpressionFingerprint = (
  context: ChunkLoadingFunctionContext,
  expression: NodePath<Expression>
): boolean => {
  if (!is.callExpression(expression)) {
    return false;
  }

  const args = expression.node?.arguments;
  if (args?.length !== 1) {
    return false;
  }

  if (!is.identifier(args[0])) {
    return false;
  }

  if (args[0].name !== context.chunkIdParam.node?.name) {
    return false;
  }

  return true;
};

const hasJSLiteral = (path: NodePath<Node>): boolean => {
  let hasJSLiteral = false;

  traverse(path.node, {
    Literal(path) {
      if (
        typeof path.node?.value === "string" &&
        path.node.value.includes(".js")
      ) {
        hasJSLiteral = true;
        this.stop();
      }
    },
  });

  return hasJSLiteral;
};

export const matchesHardcodedHashFunction = (
  path: NodePath<AssignmentExpression>,
  leftIdentifier: string,
  rightIdentifier: string
): boolean => {
  const left = path.get("left");
  if (
    is.memberExpression(left) &&
    is.identifier(left.node?.object) &&
    is.identifier(left.node?.property)
  ) {
    if (
      left.node.object.name !== leftIdentifier ||
      left.node.property.name !== rightIdentifier
    ) {
      return false; // it can't be the function we want to get the assignent from
    }
  } else {
    return false;
  }

  const right = path.get("right");
  if (is.functionExpression(right) || is.arrowFunctionExpression(right)) {
    if (right.node?.params.length !== 0) {
      return false;
    }

    return true;
  }

  return false;
};

export const matchesPropertyAssignChunkBuilderFunction = (
  path: NodePath<AssignmentExpression>,
  leftIdentifier: string,
  rightIdentifier: string
): boolean => {
  const left = path.get("left");
  if (
    is.memberExpression(left) &&
    is.identifier(left.node?.object) &&
    is.identifier(left.node?.property)
  ) {
    if (
      left.node.object.name !== leftIdentifier ||
      left.node.property.name !== rightIdentifier
    ) {
      return false; // it can't be the function we want to get the assignent from
    }
  } else {
    return false;
  }

  const right = path.get("right");
  if (is.functionExpression(right) || is.arrowFunctionExpression(right)) {
    if (right.node?.params.length !== 1) {
      return false;
    }

    return hasJSLiteral(right);
  }

  return false;
};

export const matchesFunctionDeclarationChunkBuilderFunction = (
  path: NodePath<FunctionDeclaration>,
  functionIdentifier: string
): boolean => {
  if (
    !is.identifier(path.node?.id) ||
    path.node.id.name !== functionIdentifier
  ) {
    return false;
  }

  if (path.node.params.length !== 1) {
    return false;
  }

  return hasJSLiteral(path);
};

// Vite
export const getViteChunks = (ast: Program): string[] => {
  const chunks: string[] = [];

  traverse(ast, {
    Identifier(path) {
      if (path.node?.name !== VITE_MAP_DEPS_FINGERPRINT) {
        return;
      }

      const variableDeclarator = path.parentPath;
      if (!is.variableDeclarator(variableDeclarator)) {
        return;
      }

      variableDeclarator.traverse({
        Literal(path) {
          if (typeof path.node?.value !== "string") {
            return;
          }

          const value = path.node.value;
          if (value.includes(".js")) {
            chunks.push(value);
          }
        },
      });

      this.stop();
    },
  });

  return chunks;
};

// Turbopack
export const getTurbopackChunks = (ast: Program): string[] => {
  const chunks: string[] = [];

  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.get("left");
      if (!is.memberExpression(left)) {
        return;
      }

      const obj = left.node?.object;
      const prop = left.node?.property;
      if (!is.identifier(obj) || !is.identifier(prop)) {
        return;
      }

      // Check for self.__TURBOPACK__ or self.__turbopack__
      if (obj.name !== "self") {
        return;
      }

      if (
        prop.name !== "TURBOPACK" &&
        prop.name !== "turbopack" &&
        prop.name !== "TURBOPACK_LOADING"
      ) {
        return;
      }

      // Extract all string literals from right side
      const right = path.get("right");
      right.traverse({
        Literal(literalPath) {
          if (typeof literalPath.node?.value !== "string") {
            return;
          }

          const value = literalPath.node.value;
          if (value.includes(".js") || value.includes("/_next/") || value.includes("/static/chunks/")) {
            chunks.push(value);
          }
        },
      });
    },
    CallExpression(path) {
      // Check for turbopackLoading calls
      if (!is.callExpression(path)) return;
      const callee = path.node?.callee;
      if (!is.memberExpression(callee)) return;

      const obj = callee.object;
      const prop = callee.property;
      if (!is.identifier(obj) || !is.identifier(prop)) return;

      if (obj.name === "self" && (prop.name === "TURBOPACK_LOADING" || prop.name === "turbopackLoading")) {
        const args = path.node?.arguments;
        if (args && args.length > 0 && is.literal(args[0]) && typeof args[0].value === "string") {
          chunks.push(args[0].value);
        }
      }
    },
  });

  return chunks;
};

// Google lazy-loaded chunks
export const getGoogleLazyChunks = (ast: Program): string[] => {
  const chunks: string[] = [];

  traverse(ast, {
    CallExpression(path) {
      if (!is.callExpression(path)) return;
      const callee = path.node?.callee;
      if (!is.memberExpression(callee)) return;

      const obj = callee.object;
      const prop = callee.property;
      if (!is.identifier(obj) || !is.identifier(prop)) return;

      // Check for google.chunk or google.lazyChunk patterns
      if (obj.name === "google" && (prop.name === "chunk" || prop.name === "lazyChunk")) {
        const args = path.node?.arguments;
        if (args && args.length > 0) {
          const arg = args[0];
          if (is.literal(arg) && typeof arg.value === "string") {
            chunks.push(arg.value);
          }
        }
      }
    },
    // Also check for require.ensure or dynamic import with google patterns
    ImportDeclaration(path) {
      const source = path.node?.source;
      if (source && typeof source.value === "string" && (source.value.includes("google") && source.value.includes("chunk"))) {
        chunks.push(source.value);
      }
    },
  });

  return chunks;
};

// Next.js
export const getNextJsChunks = (ast: Program): string[] => {
  const chunks: string[] = [];

  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.get("left");
      if (!is.memberExpression(left)) {
        return;
      }

      // Check for self.__BUILD_MANIFEST or self.__SSG_MANIFEST
      const obj = left.node?.object;
      const prop = left.node?.property;
      if (!is.identifier(obj) || !is.identifier(prop)) {
        return;
      }

      if (obj.name !== "self") {
        return;
      }

      if (
        prop.name !== NEXTJS_BUILD_MANIFEST_FINGERPRINT &&
        prop.name !== NEXTJS_SSG_MANIFEST_FINGERPRINT
      ) {
        return;
      }

      // Extract all string literals from right side (manifest object)
      const right = path.get("right");
      right.traverse({
        Literal(literalPath) {
          if (typeof literalPath.node?.value !== "string") {
            return;
          }

          const value = literalPath.node.value;
          // Match paths like "/_next/static/chunks/..." or static JS files
          if (value.includes(".js") || value.includes("/_next/")) {
            chunks.push(value);
          }
        },
      });
    },
  });

  return chunks;
};

