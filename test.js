const numbers = [1, 2, 3, 4, 5, 6];
const pairs = [[1, 2], [3, 4], [5, 6]];

// Define list tag function
function list(strings) {
    return strings.raw[0];
}

// Single-variable comprehension
const squaredEvens = list`x * x for (x of numbers) if (x % 2 === 0)`;
console.log("Squared evens:", squaredEvens);

// Using destructuring
const pairSums = list`x + y for ([x, y] of pairs)`;
console.log("Pair sums:", pairSums);

// Nested comprehension
const products = list`x * y for (x of numbers) for (y of numbers) if (x !== y)`;
console.log("Products:", products);