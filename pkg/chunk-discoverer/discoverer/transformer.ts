import { Program } from "acorn";
import { generate } from "astring";
import { builders as b, is, NodePath, traverse } from "estree-toolkit";
import {
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  MemberExpression,
} from "estree-toolkit/dist/generated/types";
import {
  ChunkLoadingFingerprintContext,
  matchesFunctionDeclarationChunkBuilderFunction,
  matchesHardcodedHashFunction,
  matchesPropertyAssignChunkBuilderFunction,
} from "./fingerprinting";

// Building this index costs one full AST traversal. Before, every
// simplifyCallExpression call re-traversed the whole program, which on a
// multi-MB bundle is seconds per optimization step.
interface ChunkBuilderIndex {
  properties: Map<string, NodePath<Expression>>;
  functions: Map<string, NodePath<FunctionDeclaration>>;
}

const chunkBuilderIndexCache = new WeakMap<Program, ChunkBuilderIndex>();

const getChunkBuilderIndex = (ast: Program): ChunkBuilderIndex => {
  const cached = chunkBuilderIndexCache.get(ast);
  if (cached) {
    return cached;
  }

  const index: ChunkBuilderIndex = {
    properties: new Map(),
    functions: new Map(),
  };

  traverse(ast, {
    AssignmentExpression(path) {
      const left = path.get("left");
      if (
        !is.memberExpression(left) ||
        !is.identifier(left.node?.object) ||
        !is.identifier(left.node?.property)
      ) {
        return;
      }

      const leftIdentifier = left.node.object.name;
      const rightIdentifier = left.node.property.name;
      const key = `${leftIdentifier}.${rightIdentifier}`;
      if (index.properties.has(key)) {
        return;
      }

      if (
        matchesPropertyAssignChunkBuilderFunction(
          path,
          leftIdentifier,
          rightIdentifier
        ) ||
        matchesHardcodedHashFunction(path, leftIdentifier, rightIdentifier)
      ) {
        index.properties.set(key, path.get("right") as any);
      }
    },
    FunctionDeclaration(path) {
      if (!is.identifier(path.node?.id)) {
        return;
      }

      const name = path.node.id.name;
      if (index.functions.has(name)) {
        return;
      }

      if (matchesFunctionDeclarationChunkBuilderFunction(path, name)) {
        index.functions.set(name, path);
      }
    },
  });

  chunkBuilderIndexCache.set(ast, index);
  return index;
};

export const getChunkFunctionCode = (
  context: ChunkLoadingFingerprintContext,
  ast: Program
): string | undefined => {
  let expressionNode: any = context.expressionContext.expression?.node;
  if (!expressionNode) {
    return;
  }

  const expressionToOptize = b.blockStatement([
    b.expressionStatement(expressionNode),
  ]);

  let foundOptimization: boolean;
  do {
    foundOptimization = false;

    // add a root node in case there is no parent
    traverse(expressionToOptize, {
      MemberExpression(path) {
        if (simplifyMemberExpression(path)) {
          foundOptimization = true;
          this.stop();
        }
      },
      CallExpression(path) {
        if (simplifyCallExpression(path, ast)) {
          foundOptimization = true;
          this.stop();
        }
      },
    });
  } while (foundOptimization);

  if (!context.functionContext.function.node) {
    return;
  }

  const originalExpression = expressionToOptize.body[0] as ExpressionStatement;

  // returns the code for the new function
  return generate(
    b.arrowFunctionExpression(
      [context.functionContext.function.node.params[0]],
      b.blockStatement([b.returnStatement(originalExpression.expression)])
    )
  );
};

const simplifyMemberExpression = (
  expression: NodePath<MemberExpression>
): boolean => {
  let simplified = false;

  const simplify = () => {
    expression.replaceWith(b.literal("")); // replacing with an empty string
    simplified = true;
  };

  if (
    is.memberExpression(expression) &&
    is.identifier(expression.node?.object) &&
    is.identifier(expression.node?.property)
  ) {
    if (is.callExpression(expression.parent)) {
      if (expression.parent.callee === expression.node) {
        return false;
      } else {
        simplify();
        return true;
      }
    }

    simplify();
    return true;
  }

  return simplified;
};

export const simplifyCallExpression = (
  expression: NodePath<CallExpression>,
  ast: Program
): boolean => {
  if (simplifyMemberExpressionCall(expression, ast)) {
    return true;
  }

  return simplifyFunctionCall(expression, ast);
};

const simplifyMemberExpressionCall = (
  expression: NodePath<CallExpression>,
  ast: Program
): boolean => {
  const callee = expression.node?.callee;
  if (!is.memberExpression(callee)) {
    return false; // can't simplify
  }

  if (!is.identifier(callee.object)) {
    return false;
  }

  if (!is.identifier(callee.property)) {
    return false;
  }

  const leftIdentifier = callee.object;
  const rightIdentifier = callee.property;

  const functionExpression = getChunkBuilderIndex(ast).properties.get(
    `${leftIdentifier.name}.${rightIdentifier.name}`
  );

  if (!functionExpression?.node) {
    return false;
  }

  if (expression.node?.arguments.length === 1) {
    // we found the chunk function, now it's time to replace the original call with this one
    expression.replaceWith(
      b.callExpression(functionExpression.node, expression.node?.arguments)
    );
    return true;
  }

  if (expression.node?.arguments.length === 0) {
    // we found the chunk function, now it's time to replace the original call with this one
    expression.replaceWith(b.callExpression(functionExpression.node, []));
    return true;
  }

  return false;
};

const simplifyFunctionCall = (
  expression: NodePath<CallExpression>,
  ast: Program
): boolean => {
  const callee = expression.node?.callee;
  if (!is.identifier(callee)) {
    return false; // can't simplify
  }

  const identifier = callee.name;

  const functionDeclaration = getChunkBuilderIndex(ast).functions.get(
    identifier
  );

  if (!functionDeclaration?.node) {
    return false;
  }

  if (expression.node?.arguments.length !== 1) {
    return false;
  }

  // we found the chunk function, now it's time to replace the original call with this one
  expression.replaceWith(
    b.callExpression(
      b.functionExpression(
        functionDeclaration.node.id,
        functionDeclaration.node.params,
        functionDeclaration.node.body
      ),
      expression.node?.arguments
    )
  );

  return true;
};
