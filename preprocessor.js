/**
 * This script transforms list comprehensions written in a custom format
 * into valid JavaScript code. It processes the input code, identifies list comprehensions,
 * and replaces them with equivalent JavaScript constructs.
 * @param code
 * @returns {*}
 */
function transformListComprehension(code) {
    return code.replace(/\/\*list\*\/`([^`]+)`/g, (fullMatch, content) => {
        // First, extract the expression part
        const parts = content.split(/\s+for\s+/);
        if (parts.length < 2) return fullMatch;

        const expr = parts[0];
        const clauses = [];

        // Process each for/if clause
        for (let i = 1; i < parts.length; i++) {
            const clauseMatch = parts[i].match(/^\(([^)]+)\s+of\s+([^)]+)\)(\s+if\s+\(([^)]+)\))?/);
            if (!clauseMatch) continue;

            clauses.push({
                loopVar: clauseMatch[1],
                iterable: clauseMatch[2],
                condition: clauseMatch[4] || null
            });
        }

        if (clauses.length === 1) {
            // Single level comprehension
            const {loopVar, iterable, condition} = clauses[0];
            const varName = loopVar.includes("[") ? `(${loopVar})` : loopVar;
            const filterPart = condition ? `.filter(${varName} => ${condition})` : "";
            return `(${iterable})${filterPart}.map(${varName} => ${expr})`;

        } else if (clauses.length === 2) {
            // Nested comprehension
            const {loopVar: loopVar1, iterable: iterable1, condition: condition1} = clauses[0];
            const {loopVar: loopVar2, iterable: iterable2, condition: condition2} = clauses[1];

            const varName1 = loopVar1.includes("[") ? `(${loopVar1})` : loopVar1;
            const varName2 = loopVar2.includes("[") ? `(${loopVar2})` : loopVar2;

            const filter1 = condition1 ? `.filter(${varName1} => ${condition1})` : "";
            const filter2 = condition2 ? `.filter(${varName2} => ${condition2})` : "";

            return `(${iterable1})${filter1}.flatMap(${varName1} => (${iterable2})${filter2}.map(${varName2} => ${expr}))`;
        }

        return fullMatch;
    });
}
// Read file
const fs = require("fs");
const inputCode = fs.readFileSync("test.js", "utf8");
const transformedCode = transformListComprehension(inputCode);

// Write transformed file for Babel
fs.writeFileSync("transformed.js", transformedCode);
