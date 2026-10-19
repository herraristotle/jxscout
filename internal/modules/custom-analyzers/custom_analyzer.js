// custom_analyzer.js - Custom analyzer runner for regex, derived, and script-based analyzers

function runRegexAnalyzer(content, pattern) {
    try {
        const regex = new RegExp(pattern, 'g');
        const matches = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            matches.push({
                value: match[0],
                index: match.index,
                length: match[0].length
            });
        }
        return matches;
    } catch (e) {
        return { error: e.message };
    }
}

function runScriptAnalyzer(scriptPath, input) {
    try {
        const script = require(scriptPath);
        return script.analyze(input);
    } catch (e) {
        return { error: e.message };
    }
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: custom_analyzer.js <command> <input>");
        process.exit(1);
    }

    const command = args[0];
    const input = JSON.parse(args[1]);

    if (command === "regex") {
        const { content, pattern } = input;
        const result = runRegexAnalyzer(content, pattern);
        console.log(JSON.stringify(result));
    } else if (command === "script") {
        const { scriptPath, content, url, filePath } = input;
        const result = runScriptAnalyzer(scriptPath, { content, url, filePath });
        console.log(JSON.stringify(result));
    } else {
        console.error("Unknown command:", command);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { runRegexAnalyzer, runScriptAnalyzer };