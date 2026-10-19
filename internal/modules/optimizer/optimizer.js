// optimizer.js - JavaScript optimizer for string inlining, concat resolution, JSON.parse eval

function resolveToString(node, constants) {
    if (!node) return null;

    // String literal
    if (node.type === "StringLiteral") {
        return node.value;
    }

    // Identifier - lookup in constants
    if (node.type === "Identifier") {
        return constants.get(node.name) ?? null;
    }

    // Binary expression with + operator (string concatenation)
    if (node.type === "BinaryExpression" && node.operator === "+") {
        const left = resolveToString(node.left, constants);
        const right = resolveToString(node.right, constants);

        if (left !== null && right !== null) {
            return left + right;
        }
    }

    // Template literal
    if (node.type === "TemplateLiteral") {
        if (node.expressions && node.expressions.length > 0) {
            let result = "";
            for (let i = 0; i < node.quasis.length; i++) {
                result += node.quasis[i].value.cooked ?? node.quasis[i].value.raw ?? "";

                if (i < node.expressions.length) {
                    const exprValue = resolveToString(node.expressions[i], constants);
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

function trackDeclaration(node, constants) {
    if (node.type === "VariableDeclaration") {
        for (const decl of node.declarations || []) {
            if (decl.id?.type === "Identifier" && decl.init) {
                const value = resolveToString(decl.init, constants);
                if (value !== null) {
                    constants.set(decl.id.name, value);
                }
            }
        }
    }
}

function tryParseJSON(node, constants) {
    if (
        node.type === "CallExpression" &&
        node.callee?.type === "MemberExpression" &&
        node.callee.object?.type === "Identifier" &&
        node.callee.object.name === "JSON" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "parse"
    ) {
        if (node.arguments?.[0]) {
            const jsonStr = resolveToString(node.arguments[0], constants);
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

function optimizeCode(source) {
    const constants = new Map();
    let changes = 0;

    const acorn = require("acorn");
    const walk = require("acorn-walk");

    let ast;
    try {
        ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module" });
    } catch {
        try {
            ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script" });
        } catch {
            return { optimized_content: source, changes: 0 };
        }
    }

    // First pass: collect constant declarations
    walk.simple(ast, {
        VariableDeclaration(node) {
            trackDeclaration(node, constants);
        },
    });

    // Second pass: collect mutations
    const mutations = [];

    walk.simple(ast, {
        Identifier(node) {
            // Skip if it's part of a declaration (left-hand side)
            if (node.parent?.type === "VariableDeclarator" && node.parent.id === node) return;
            if (node.parent?.type === "FunctionDeclaration" && node.parent.id === node) return;
            if (node.parent?.type === "FunctionExpression" && node.parent.id === node) return;
            if (node.parent?.type === "ArrowFunctionExpression" && node.parent.id === node) return;

            const value = constants.get(node.name);
            if (value !== null && node.loc) {
                mutations.push({
                    start: node.start,
                    end: node.end,
                    replacement: JSON.stringify(value),
                });
                changes++;
            }
        },
        BinaryExpression(node) {
            if (node.operator === "+" && node.loc) {
                const value = resolveToString(node, constants);
                if (value !== null) {
                    mutations.push({
                        start: node.start,
                        end: node.end,
                        replacement: JSON.stringify(value),
                    });
                    changes++;
                }
            }
        },
        CallExpression(node) {
            // JSON.parse evaluation
            if (tryParseJSON(node, constants) !== null && node.loc) {
                const jsonResult = tryParseJSON(node, constants);
                if (jsonResult !== null) {
                    mutations.push({
                        start: node.start,
                        end: node.end,
                        replacement: JSON.stringify(jsonResult),
                    });
                    changes++;
                }
            }
        },
    });

    // Apply mutations in reverse order
    mutations.sort((a, b) => b.start - a.start);

    let optimized = source;
    for (const mut of mutations) {
        optimized = optimized.slice(0, mut.start) + mut.replacement + optimized.slice(mut.end);
    }

    return { optimized_content: optimized, changes };
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: optimizer.js <filepath>");
        process.exit(1);
    }

    const filePath = args[0];
    const fs = require("fs");
    const source = fs.readFileSync(filePath, "utf-8");
    const result = optimizeCode(source);

    console.log(JSON.stringify(result));
}

if (require.main === module) {
    main();
}

module.exports = { optimizeCode };