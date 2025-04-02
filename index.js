/**
 * Babel plugin for JavaScript list comprehension syntax
 * Transforms Python-style list comprehension syntax using tagged template literals into
 * equivalent JavaScript array methods (map, filter, flatMap).
 *
 * Usage example:
 * const result = list`x * x for (x of numbers) if (x % 2 === 0)`;
 * // Transforms to: numbers.filter(x => x % 2 === 0).map(x => x * x);
 *
 * @param {Object} babel - The Babel object passed by the Babel runtime
 * @returns {Object} Babel plugin definition
 */
module.exports = function(babel) {
    const { types: t } = babel;

    /**
     * Transforms list comprehension clauses into equivalent JavaScript array operations
     *
     * @param {string} expr - The expression to be mapped (left side of the comprehension)
     * @param {Array<Object>} clauses - Array of clause objects with loopVar, iterable, and condition
     * @param {Object} babel - The Babel object for parsing expressions
     * @returns {Object} AST node representing the transformed expression
     */
    function transformListComprehension(expr, clauses, babel) {
        let result;

        if (clauses.length === 1) {
            // Single level comprehension
            const {loopVar, iterable, condition} = clauses[0];

            // Parse the components into AST nodes
            const iterableNode = babel.parse(iterable).program.body[0].expression;
            const exprNode = babel.parse(expr).program.body[0].expression;

            // Create map function with appropriate parameter (support destructuring)
            let param;
            if (loopVar.includes('[') || loopVar.includes('{')) {
                param = babel.parse(`(${loopVar}) => {}`).program.body[0].expression.params[0];
            } else {
                param = t.identifier(loopVar);
            }
            const mapCallback = t.arrowFunctionExpression([param], exprNode);

            // Add filter if condition exists
            if (condition) {
                const conditionNode = babel.parse(condition).program.body[0].expression;
                const filterCallback = t.arrowFunctionExpression([param], conditionNode);

                result = t.callExpression(
                    t.memberExpression(
                        t.callExpression(
                            t.memberExpression(iterableNode, t.identifier("filter")),
                            [filterCallback]
                        ),
                        t.identifier("map")
                    ),
                    [mapCallback]
                );
            } else {
                result = t.callExpression(
                    t.memberExpression(iterableNode, t.identifier("map")),
                    [mapCallback]
                );
            }
        } else if (clauses.length === 2) {
            // Nested comprehension logic
            const {loopVar: loopVar1, iterable: iterable1, condition: condition1} = clauses[0];
            const {loopVar: loopVar2, iterable: iterable2, condition: condition2} = clauses[1];

            const iterableNode1 = babel.parse(iterable1).program.body[0].expression;
            const iterableNode2 = babel.parse(iterable2).program.body[0].expression;
            const exprNode = babel.parse(expr).program.body[0].expression;

            // Create parameters with support for destructuring
            let param1, param2;
            if (loopVar1.includes('[') || loopVar1.includes('{')) {
                param1 = babel.parse(`(${loopVar1}) => {}`).program.body[0].expression.params[0];
            } else {
                param1 = t.identifier(loopVar1);
            }

            if (loopVar2.includes('[') || loopVar2.includes('{')) {
                param2 = babel.parse(`(${loopVar2}) => {}`).program.body[0].expression.params[0];
            } else {
                param2 = t.identifier(loopVar2);
            }

            // Create inner map function
            const mapCallback = t.arrowFunctionExpression([param2], exprNode);

            // Add inner filter if condition exists
            let innerOperation;
            if (condition2) {
                const conditionNode2 = babel.parse(condition2).program.body[0].expression;
                const filterCallback2 = t.arrowFunctionExpression([param2], conditionNode2);

                innerOperation = t.callExpression(
                    t.memberExpression(
                        t.callExpression(
                            t.memberExpression(iterableNode2, t.identifier("filter")),
                            [filterCallback2]
                        ),
                        t.identifier("map")
                    ),
                    [mapCallback]
                );
            } else {
                innerOperation = t.callExpression(
                    t.memberExpression(iterableNode2, t.identifier("map")),
                    [mapCallback]
                );
            }

            // Create outer flatMap function
            const flatMapCallback = t.arrowFunctionExpression([param1], innerOperation);

            // Add outer filter if condition exists
            if (condition1) {
                const conditionNode1 = babel.parse(condition1).program.body[0].expression;
                const filterCallback1 = t.arrowFunctionExpression([param1], conditionNode1);

                result = t.callExpression(
                    t.memberExpression(
                        t.callExpression(
                            t.memberExpression(iterableNode1, t.identifier("filter")),
                            [filterCallback1]
                        ),
                        t.identifier("flatMap")
                    ),
                    [flatMapCallback]
                );
            } else {
                result = t.callExpression(
                    t.memberExpression(iterableNode1, t.identifier("flatMap")),
                    [flatMapCallback]
                );
            }
        }

        return result;
    }

    return {
        name: "babel-plugin-list-comprehension",
        visitor: {
            /**
             * Handles list comprehension syntax using tagged template literals: list`x * x for (x of numbers)`
             *
             * @param {Object} path - Babel path object representing the TaggedTemplateExpression
             */
            TaggedTemplateExpression(path) {
                // Check if the tag name is 'list'
                if (path.node.tag.type === "Identifier" && path.node.tag.name === "list") {
                    const quasiContent = path.node.quasi.quasis[0].value.raw;

                    // Parse the list comprehension components
                    const parts = quasiContent.split(/\s+for\s+/);
                    if (parts.length < 2) return;

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

                    const result = transformListComprehension(expr, clauses, babel);

                    if (result) {
                        path.replaceWith(result);
                    }
                }
            },

            /**
             * Handler for potential future array-based list comprehension syntax: [x * x for (x of numbers)]
             * Currently not implemented.
             *
             * @param {Object} path - Babel path object representing the ArrayExpression
             */
            ArrayExpression(path) {
                // Placeholder for future array-based syntax implementation
            }
        }
    };
};