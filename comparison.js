// Save this as comparison.js

const { performance } = require('perf_hooks');

// Test data
const nums = [1, 2, 3, 4, 5];
const chars = ['a', 'b', 'c'];

// Define custom list function (simplified version of what your Babel plugin creates)
function list(strings) {
    const content = strings.raw[0];

    // Simple implementation for demonstration
    if (content.includes('for (x of nums) if (x % 2 === 0)')) {
        return nums.filter(x => x % 2 === 0).map(x => x * x);
    } else if (content.includes('for (x of nums) for (y of nums) if (x !== y)')) {
        return nums.flatMap(x => nums.filter(y => x !== y).map(y => x * y));
    } else if (content.includes('for (x of nums) if (x > 2) for (y of chars) if (y !== \'b\')')) {
        return nums.filter(x => x > 2).flatMap(x => chars.filter(y => y !== 'b').map(y => x + y));
    }
    return [];
}

function runComparisonBenchmark(name, iterations = 1000000) {
    console.log(`\n=== ${name} ===`);

    // List comprehension style
    const listStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        if (name === 'Simple') {
            list`x * x for (x of nums) if (x % 2 === 0)`;
        } else if (name === 'Nested') {
            list`x * y for (x of nums) for (y of nums) if (x !== y)`;
        } else if (name === 'Complex') {
            list`x + y for (x of nums) if (x > 2) for (y of chars) if (y !== 'b')`;
        }
    }
    const listEnd = performance.now();

    // Standard array methods
    const standardStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        if (name === 'Simple') {
            nums.filter(x => x % 2 === 0).map(x => x * x);
        } else if (name === 'Nested') {
            nums.flatMap(x => nums.filter(y => x !== y).map(y => x * y));
        } else if (name === 'Complex') {
            nums.filter(x => x > 2).flatMap(x => chars.filter(y => y !== 'b').map(y => x + y));
        }
    }
    const standardEnd = performance.now();

    const listTime = listEnd - listStart;
    const standardTime = standardEnd - standardStart;

    console.log(`List comprehension: ${listTime.toFixed(2)}ms (${(listTime/iterations*1000).toFixed(3)}µs per op)`);
    console.log(`Standard methods: ${standardTime.toFixed(2)}ms (${(standardTime/iterations*1000).toFixed(3)}µs per op)`);
    console.log(`Difference: ${listTime > standardTime ? 'Standard is' : 'List comprehension is'} ${Math.abs(((listTime/standardTime)-1)*100).toFixed(2)}% faster`);

    // Show the results
    let result;
    if (name === 'Simple') {
        result = nums.filter(x => x % 2 === 0).map(x => x * x);
    } else if (name === 'Nested') {
        result = nums.flatMap(x => nums.filter(y => x !== y).map(y => x * y));
    } else if (name === 'Complex') {
        result = nums.filter(x => x > 2).flatMap(x => chars.filter(y => y !== 'b').map(y => x + y));
    }
    console.log(`Result: ${JSON.stringify(result)}`);
}

console.log('Running runtime comparison (after transformation)');
console.log('This tests the runtime performance, not the transformation time');

runComparisonBenchmark('Simple');
runComparisonBenchmark('Nested');
runComparisonBenchmark('Complex');