const numbers = [1, 2, 3, 4, 5, 6];
const pairs = [[1, 2], [3, 4], [5, 6]];

// ✅ Single variable comprehension
const squaredEvens = (numbers).filter(x => x % 2 === 0).map(x => x * x);

// ✅ Multiple variables (fix destructuring)
const pairSums = (pairs).map(([x, y]) => x + y);

// ✅ Nested comprehension (fix syntax)
const products = (numbers).flatMap(x => (numbers).filter(y => x !== y).map(y => x * y));

console.log(squaredEvens); // [4, 16, 36]
console.log(pairSums); // [3, 7, 11]
console.log(products); // All pair products except squares
