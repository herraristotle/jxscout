// unpacker.js - JavaScript unpacker for packed/obfuscated code

function unpackCode(source) {
    // This is a basic implementation that can be extended
    // Real unpackers would handle: webpack bundles, eval/Function obfuscation,
    // string arrays, control flow flattening, etc.

    const results = {
        files: []
    };

    // Check for common packed patterns
    // 1. eval(function(p,a,c,k,e,d)...) - Dean Edwards packer
    if (source.includes("eval(function(p,a,c,k,e,d)")) {
        // Extract the packed code and attempt to unpack
        const unpacked = unpackDeanEdwards(source);
        if (unpacked) {
            results.files.push({
                path: "unpacked_dean_edwards.js",
                content: unpacked
            });
        }
    }

    // 2. webpack bundles with array of modules
    if (source.includes("webpackBootstrap") || source.includes("__webpack_require__")) {
        const extracted = extractWebpackModules(source);
        if (extracted.length > 0) {
            results.files.push(...extracted);
        }
    }

    // 3. Generic eval/Function constructor calls
    const evalExtracts = extractEvalCalls(source);
    if (evalExtracts.length > 0) {
        results.files.push(...evalExtracts);
    }

    // 4. String array obfuscation (common in obfuscated JS)
    if (source.includes("0x") && (source.includes("String.fromCharCode") || source.includes("parseInt"))) {
        const deobfuscated = deobfuscateStringArray(source);
        if (deobfuscated) {
            results.files.push({
                path: "deobfuscated_string_array.js",
                content: deobfuscated
            });
        }
    }

    // 5. Check for Function constructor with string arguments
    const functionExtracts = extractFunctionConstructor(source);
    if (functionExtracts.length > 0) {
        results.files.push(...functionExtracts);
    }

    // If nothing found, return original (no files to unpack)
    return results;
}

function unpackDeanEdwards(source) {
    // Dean Edwards packer pattern: eval(function(p,a,c,k,e,d){...})
    const regex = /eval\(function\(p,a,c,k,e,d\)\s*\{([\s\S]*?)\}\)\)/;
    const match = source.match(regex);
    if (!match) return null;

    // This is a simplified version - real unpacking is complex
    // In practice, you'd use a dedicated unpacker library
    return "// Dean Edwards packer detected - requires manual unpacking\n" + source.substring(0, 500) + "...";
}

function extractWebpackModules(source) {
    const files = [];
    // Look for webpack module definitions: /******/ (function(module, exports, __webpack_require__) { ... })
    const moduleRegex = /\/[*\/]+\s*\(function\(module,\s*exports,\s*__webpack_require__\)\s*\{([\s\S]*?)\}\)\s*;/g;
    let match;
    let index = 0;
    while ((match = moduleRegex.exec(source)) !== null) {
        files.push({
            path: `webpack_module_${index}.js`,
            content: match[1]
        });
        index++;
    }
    return files;
}

function extractEvalCalls(source) {
    const files = [];
    // Find eval() calls with string arguments
    const evalRegex = /eval\s*\(\s*(["'`])([\s\S]*?)\1\s*\)/g;
    let match;
    let index = 0;
    while ((match = evalRegex.exec(source)) !== null) {
        const content = match[2];
        if (content.length > 50) { // Only meaningful content
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
    // Look for common string array patterns
    // e.g., var _0x1234 = ['string1', 'string2', ...];
    const arrayRegex = /(?:var|let|const)\s+(_0x[a-f0-9]+)\s*=\s*\[([\s\S]*?)\];/;
    const match = source.match(arrayRegex);
    if (!match) return null;

    const varName = match[1];
    const arrayContent = match[2];

    // Extract strings from the array
    const strings = arrayContent.match(/["']([^"']+)["']/g);
    if (!strings || strings.length === 0) return null;

    // Look for usages of this array
    // e.g., _0x1234[0], _0x1234['0x1']
    const usageRegex = new RegExp(varName + '\\[([^\\]]+)\\]', 'g');
    let usageMatch;
    const replaced = source.replace(usageRegex, (match, index) => {
        const idx = parseInt(index.replace(/['"]/g, ''), 16);
        if (idx < strings.length) {
            return strings[idx].replace(/^["']|["']$/g, '');
        }
        return match;
    });

    if (replaced !== source) {
        return "// Deobfuscated string array: " + varName + "\n" + replaced;
    }
    return null;
}

function extractFunctionConstructor(source) {
    const files = [];
    // Find new Function('...') or Function('...') calls
    const funcRegex = /(?:new\s+)?Function\s*\(\s*(["'`])([\s\S]*?)\1\s*\)/g;
    let match;
    let index = 0;
    while ((match = funcRegex.exec(source)) !== null) {
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