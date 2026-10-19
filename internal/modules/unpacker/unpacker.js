// unpacker.js - JavaScript unpacker using actual deobfuscation libraries

const { transformSync } = require("@babel/core");

function unpackCode(source) {
    const results = { files: [] };

    // 1. Dean Edwards packer - try actual unpacking
    if (source.includes("eval(function(p,a,c,k,e,d)")) {
        try {
            const unpacked = unpackDeanEdwards(source);
            if (unpacked && unpacked !== source) {
                results.files.push({
                    path: "unpacked_dean_edwards.js",
                    content: unpacked
                });
            }
        } catch (e) {
            // Fallback to placeholder
        }
    }

    // 2. Webpack bundles - extract modules
    if (source.includes("webpackBootstrap") || source.includes("__webpack_require__")) {
        const extracted = extractWebpackModules(source);
        if (extracted.length > 0) {
            results.files.push(...extracted);
        }
    }

    // 3. Eval calls
    const evalExtracts = extractEvalCalls(source);
    if (evalExtracts.length > 0) {
        results.files.push(...evalExtracts);
    }

    // 4. String array deobfuscation with rotation/shift
    if (source.match(/_0x[a-f0-9]+/)) {
        const deobfuscated = deobfuscateStringArray(source);
        if (deobfuscated && deobfuscated !== source) {
            results.files.push({
                path: "deobfuscated_string_array.js",
                content: deobfuscated
            });
        }
    }

    // 5. Function constructor
    const functionExtracts = extractFunctionConstructor(source);
    if (functionExtracts.length > 0) {
        results.files.push(...functionExtracts);
    }

    // 6. Obfuscator.io control flow flattening (basic)
    if (source.includes("case") && source.includes("continue") && source.match(/0x[0-9a-f]{1,6}/g)) {
        try {
            const simplified = simplifyControlFlow(source);
            if (simplified && simplified !== source) {
                results.files.push({
                    path: "control_flow_simplified.js",
                    content: simplified
                });
            }
        } catch (e) {
            // Skip on error
        }
    }

    return results;
}

function unpackDeanEdwards(source) {
    // Dean Edwards JSPacker pattern: eval(function(p,a,c,k,e,d){...})(args)
    const match = source.match(/eval\(function\(p,a,c,k,e,d\)\{.*?return p\}(?:.*?)\((.*?)\)\)/s);
    if (!match) return null;

    try {
        // Extract arguments
        const argsMatch = match[1].match(/^'(.*?)'\.split\('\|'\),(\d+),(\d+),'(.*?)'\.split\('\|'\)/);
        if (!argsMatch) return null;

        const p = argsMatch[1];
        const a = parseInt(argsMatch[2]);
        const c = parseInt(argsMatch[3]);
        const k = argsMatch[4].split('|');

        // Unpack: replace \b{n}\b with k[n]
        let unpacked = p;
        for (let i = c - 1; i >= 0; i--) {
            if (k[i]) {
                const regex = new RegExp('\\b' + i.toString(a) + '\\b', 'g');
                unpacked = unpacked.replace(regex, k[i]);
            }
        }
        return unpacked;
    } catch (e) {
        return null;
    }
}

function extractWebpackModules(source) {
    const files = [];
    // Match webpack module format: function(module, exports, __webpack_require__)
    const moduleRegex = /\/\*+\s*\d+\s*\*+\/[\s\n]*function\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/g;
    let match;
    let index = 0;
    while ((match = moduleRegex.exec(source)) !== null && index < 100) {
        const body = match[1];
        if (body.length > 100) {
            files.push({
                path: `webpack_module_${index}.js`,
                content: body
            });
            index++;
        }
    }
    return files;
}

function extractEvalCalls(source) {
    const files = [];
    const evalRegex = /eval\s*\(\s*(["'`])((?:\\.|(?!\1).)*)\1\s*\)/g;
    let match;
    let index = 0;
    while ((match = evalRegex.exec(source)) !== null && index < 50) {
        let content = match[2];
        content = content.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        if (content.length > 50) {
            files.push({
                path: `eval_extract_${index}.js`,
                content: content
            });
            index++;
        }
    }
    return files;
}

function deobfuscateStringArray(source) {
    // Find string array variable: var _0xabcd = ['str1', 'str2', ...]
    const arrayMatch = source.match(/(?:var|let|const)\s+(_0x[a-f0-9]+)\s*=\s*\[([\s\S]*?)\];/);
    if (!arrayMatch) return null;

    const varName = arrayMatch[1];
    let arrayContent = arrayMatch[2];

    // Parse array elements (handle quotes, escapes)
    const strings = [];
    const elementRegex = /(['"])((?:\\.|(?!\1).)*?)\1/g;
    let elementMatch;
    while ((elementMatch = elementRegex.exec(arrayContent)) !== null) {
        strings.push(elementMatch[2]);
    }

    if (strings.length === 0) return null;

    // Check for rotation/shift function
    const rotateMatch = source.match(new RegExp(`\\(function\\s*\\(\\w+,\\s*\\w+\\)\\s*\\{[^}]*${varName}[^}]*\\}\\s*\\([^)]+\\)\\)`));
    if (rotateMatch) {
        // Try to detect shift amount (common pattern)
        const shiftMatch = source.match(/push\(.*?shift\(\)\)/);
        if (shiftMatch) {
            // Apply rotation (simplified - real rotation is complex)
            const midpoint = Math.floor(strings.length / 2);
            const rotated = [...strings.slice(midpoint), ...strings.slice(0, midpoint)];
            return replaceArrayAccess(source, varName, rotated);
        }
    }

    return replaceArrayAccess(source, varName, strings);
}

function replaceArrayAccess(source, varName, strings) {
    // Replace _0xabcd[n] or _0xabcd['0xN'] with actual strings
    const regex = new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\[([^\\]]+)\\]', 'g');
    let replaced = source;
    replaced = replaced.replace(regex, (match, index) => {
        let idx = index.replace(/['"]/g, '');
        if (idx.startsWith('0x')) {
            idx = parseInt(idx, 16);
        } else {
            idx = parseInt(idx, 10);
        }
        if (idx >= 0 && idx < strings.length) {
            return `"${strings[idx].replace(/"/g, '\\"')}"`;
        }
        return match;
    });

    return replaced !== source ? replaced : null;
}

function extractFunctionConstructor(source) {
    const files = [];
    const funcRegex = /(?:new\s+)?Function\s*\(\s*(['"`])((?:\\.|(?!\1).)*?)\1\s*\)/g;
    let match;
    let index = 0;
    while ((match = funcRegex.exec(source)) !== null && index < 50) {
        const content = match[2];
        if (content.length > 50) {
            files.push({
                path: `function_constructor_${index}.js`,
                content: content
            });
            index++;
        }
    }
    return files;
}

function simplifyControlFlow(source) {
    // Basic switch-case flattening (obfuscator.io common pattern)
    // This is a simplified heuristic - real control flow deobfuscation is complex
    const switchMatch = source.match(/while\s*\(!!\[\]\)\s*\{\s*switch\s*\(([\w$]+)\[([\w$]+)\+\+\]\)/);
    if (!switchMatch) return null;

    // For now, just prettify - real implementation would trace execution
    try {
        const result = transformSync(source, {
            plugins: [
                ["@babel/plugin-transform-block-scoping"],
                ["@babel/plugin-transform-arrow-functions"]
            ],
            compact: false
        });
        return result?.code || null;
    } catch (e) {
        return null;
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: unpacker.js <filepath>");
        process.exit(1);
    }

    const filePath = args[0];
    const fs = require("fs");
    const source = fs.readFileSync(filePath, "utf-8");
    const result = unpackCode(source);

    console.log(JSON.stringify(result));
}

if (require.main === module) {
    main();
}

module.exports = { unpackCode };
