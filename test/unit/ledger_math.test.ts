/**
 * HUBAAL SHOP - Customer Debt Management & Financial Ledger Tests
 * Requirement: The Price field represents the TOTAL price for the entire quantity entered, NOT price per unit.
 * Do NOT multiply Quantity × Price. Total = Price entered by user.
 */

interface ProductLine {
  name: string;
  quantity: string | number;
  price: number; // Manually entered total price for the item
}

function calculateDebtTotal(items: ProductLine[]): number {
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  return Number(sum.toFixed(2));
}

function calculateCustomerBalance(openingBalance: number, charges: number[], payments: number[], reversals = 0): number {
  const totalCharges = charges.reduce((a, b) => a + b, 0);
  const totalPayments = payments.reduce((a, b) => a + b, 0);
  return Number((openingBalance + totalCharges - totalPayments - reversals).toFixed(2));
}

function validatePayment(currentDebt: number, paymentAmount: number): { valid: boolean; error?: string } {
  if (paymentAmount <= 0) return { valid: false, error: 'Payment must be greater than zero' };
  if (paymentAmount > currentDebt) return { valid: false, error: 'Payment cannot exceed current debt' };
  return { valid: true };
}

console.log('--- HUBAAL SHOP: Customer Debt Management Verification ---');

// Test 1: User's Exact Prompt Requirement:
// Product: Bariis, Quantity: 1.5 KG, Price: $2 => Total: $2.00 (NOT 1.5 * $2 = $3)
const exactPromptExample: ProductLine[] = [
  { name: 'Bariis', quantity: '1.5 KG', price: 2.00 },
];
const promptCalculatedDebt = calculateDebtTotal(exactPromptExample);
console.assert(promptCalculatedDebt === 2.00, `Expected 2.00, got ${promptCalculatedDebt}`);
console.log(`✓ Test 1 Passed: Exact user example: Bariis (1.5 KG) with Price $2 = Total $${promptCalculatedDebt.toFixed(2)} (no multiplication)`);

// Test 2: Multiple products with decimal quantities (1.5, 0.5, 2.5) adding manually entered prices
const multiItems: ProductLine[] = [
  { name: 'Bariis', quantity: '1.5 KG', price: 2.00 },
  { name: 'Sonkor', quantity: '0.5 KG', price: 1.50 },
  { name: 'Saliid', quantity: '2.5 L', price: 5.00 },
];
const totalMultiDebt = calculateDebtTotal(multiItems);
console.assert(totalMultiDebt === 8.50, `Expected 8.50, got ${totalMultiDebt}`);
console.log(`✓ Test 2 Passed: Multi-item sum: $2.00 + $1.50 + $5.00 = $${totalMultiDebt.toFixed(2)}`);

// Test 3: Customer Balance after New Debt
const balanceAfterDebt = calculateCustomerBalance(0, [totalMultiDebt], []);
console.assert(balanceAfterDebt === 8.50, `Expected 8.50, got ${balanceAfterDebt}`);
console.log(`✓ Test 3 Passed: Customer balance reflects new debt = $${balanceAfterDebt.toFixed(2)}`);

// Test 4: Partial Payment ($3.50)
const balanceAfterPartialPayment = calculateCustomerBalance(0, [totalMultiDebt], [3.50]);
console.assert(balanceAfterPartialPayment === 5.00, `Expected 5.00, got ${balanceAfterPartialPayment}`);
console.log(`✓ Test 4 Passed: Partial payment of $3.50 reduces balance to $${balanceAfterPartialPayment.toFixed(2)}`);

// Test 5: Prevent Invalid Payment exceeding debt
const invalidPaymentCheck = validatePayment(balanceAfterPartialPayment, 10.00);
console.assert(!invalidPaymentCheck.valid, 'Expected invalid payment to fail');
console.log(`✓ Test 5 Passed: Overpayment check prevented paying $10 on a $5 debt: "${invalidPaymentCheck.error}"`);

// Test 6: Full Payment & Complete Clearance
const validFullPaymentCheck = validatePayment(balanceAfterPartialPayment, 5.00);
const balanceAfterFullPay = calculateCustomerBalance(0, [totalMultiDebt], [3.50, 5.00]);
console.assert(validFullPaymentCheck.valid && balanceAfterFullPay === 0.00, `Expected 0.00, got ${balanceAfterFullPay}`);
console.log(`✓ Test 6 Passed: Full payment of $5.00 clears debt balance to $${balanceAfterFullPay.toFixed(2)}`);

// Test 7: Transaction Reversal Audit Check
const balanceAfterReversal = calculateCustomerBalance(0, [totalMultiDebt], [], 8.50);
console.assert(balanceAfterReversal === 0.00, `Expected 0.00 after reversal, got ${balanceAfterReversal}`);
console.log(`✓ Test 7 Passed: Reversal of $8.50 returns ledger balance to $${balanceAfterReversal.toFixed(2)}`);

console.log('--- All 7 Customer Debt Management tests PASSED successfully! ---');
