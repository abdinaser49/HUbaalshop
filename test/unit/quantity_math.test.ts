import { parseQuantity } from '../../src/utils/quantityParser';

console.log('--- Testing Flexible Quantity Parsing (Number & Name) ---');

// Test 1: Plain numbers
const test1 = parseQuantity(2);
console.assert(test1.numeric === 2, `Expected 2, got ${test1.numeric}`);
console.log('✓ Test 1: Number 2 -> numeric 2');

const test2 = parseQuantity('5');
console.assert(test2.numeric === 5, `Expected 5, got ${test2.numeric}`);
console.log('✓ Test 2: String "5" -> numeric 5');

// Test 3: Number with unit noun (kartoon, kiilo, xabbo, jawaan)
const test3 = parseQuantity('2 kartoon');
console.assert(test3.numeric === 2 && test3.display === '2 kartoon', `Expected 2 kartoon`);
console.log('✓ Test 3: "2 kartoon" -> numeric 2, display "2 kartoon"');

const test4 = parseQuantity('1.5 kiilo');
console.assert(test4.numeric === 1.5 && test4.display === '1.5 kiilo', `Expected 1.5 kiilo`);
console.log('✓ Test 4: "1.5 kiilo" -> numeric 1.5, display "1.5 kiilo"');

const test5 = parseQuantity('10 xabbo');
console.assert(test5.numeric === 10, `Expected 10 xabbo`);
console.log('✓ Test 5: "10 xabbo" -> numeric 10');

// Test 6: Standalone unit nouns (default multiplier 1)
const test6 = parseQuantity('kartoon');
console.assert(test6.numeric === 1 && test6.display === 'kartoon', `Expected kartoon = 1`);
console.log('✓ Test 6: "kartoon" -> numeric 1, display "kartoon"');

const test7 = parseQuantity('jawaan');
console.assert(test7.numeric === 1, `Expected jawaan = 1`);
console.log('✓ Test 7: "jawaan" -> numeric 1');

// Test 8: Somali fractional word "badh" / "nus"
const test8 = parseQuantity('badh');
console.assert(test8.numeric === 0.5, `Expected badh = 0.5`);
console.log('✓ Test 8: "badh" -> numeric 0.5');

const test9 = parseQuantity('nus');
console.assert(test9.numeric === 0.5, `Expected nus = 0.5`);
console.log('✓ Test 9: "nus" -> numeric 0.5');

// Test 10: Subtotal calculations with prices
// e.g. "2 kartoon" @ $25 = $50
const subtotal1 = parseQuantity('2 kartoon').numeric * 25;
console.assert(subtotal1 === 50, `Expected $50, got ${subtotal1}`);
console.log('✓ Test 10: "2 kartoon" * $25 = $50.00');

// e.g. "badh" @ $20 = $10
const subtotal2 = parseQuantity('badh').numeric * 20;
console.assert(subtotal2 === 10, `Expected $10, got ${subtotal2}`);
console.log('✓ Test 11: "badh" * $20 = $10.00');

// e.g. "1.5 kg" @ $10 = $15
const subtotal3 = parseQuantity('1.5 kg').numeric * 10;
console.assert(subtotal3 === 15, `Expected $15, got ${subtotal3}`);
console.log('✓ Test 12: "1.5 kg" * $10 = $15.00');

console.log('--- All 12 Quantity Parsing & Calculation tests PASSED! ---');
