// benchmark.js
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

// Samples with different complexity
const samples = {
    simple: `
    const nums = [1, 2, 3, 4, 5];
    const result = /*list*/\`x * x for (x of nums) if (x % 2 === 0)\`;
  `,

    nested: `
    const nums = [1, 2, 3, 4, 5];
    const result = /*list*/\`x * y for (x of nums) for (y of nums) if (x !== y)\`;
  `,

    complex: `
    const nums = [1, 2, 3, 4, 5];
    const chars = ['a', 'b', 'c'];
    const result = /*list*/\`x + y for (x of nums) if (x > 2) for (y of chars) if (y !== 'b')\`;
  `
};

const standardSamples = {
    simple: `
    const nums = [1, 2, 3, 4, 5];
    const result = nums.filter(x => x % 2 === 0).map(x => x * x);
  `,

    nested: `
    const nums = [1, 2, 3, 4, 5];
    const result = nums.flatMap(x => nums.filter(y => x !== y).map(y => x * y));
  `,

    complex: `
    const nums = [1, 2, 3, 4, 5];
    const chars = ['a', 'b', 'c'];
    const result = nums.filter(x => x > 2).flatMap(x => chars.filter(y => y !== 'b').map(y => x + y));
  `
};

// Create benchmark function
function runBenchmark(name, code, iterations = 1000) {
    console.log(`\nRunning benchmark for: ${name}`);

    // Warm-up
    babel.transformSync(code, {
        filename: 'test.js',
        configFile: path.resolve('./babel.config.json')
    });

    // Measure time
    const start = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
        babel.transformSync(code, {
            filename: 'test.js',
            configFile: path.resolve('./babel.config.json')
        });
    }

    const end = process.hrtime.bigint();
    const timeInMs = Number(end - start) / 1_000_000;

    console.log(`${iterations} iterations completed in ${timeInMs.toFixed(2)}ms`);
    console.log(`Average: ${(timeInMs / iterations).toFixed(3)}ms per operation`);

    // Show transformation result
    const result = babel.transformSync(code, {
        filename: 'test.js',
        configFile: path.resolve('./babel.config.json')
    });

    console.log('\nTransformed code:');
    console.log(result.code);
}

// Run benchmarks
console.log('=== List Comprehension Babel Plugin Benchmark ===');

for (const [name, code] of Object.entries(samples)) {
    runBenchmark(name, code);
}

// Run standard JavaScript benchmarks
console.log('\n=== Standard JavaScript Array Methods Benchmark ===');

for (const [name, code] of Object.entries(standardSamples)) {
    runBenchmark(name, code);
}