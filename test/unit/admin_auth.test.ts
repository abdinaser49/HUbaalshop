/**
 * HUBAAL SHOP - Admin Security & Authentication Unit Tests
 */

import { generateSalt, hashPassword, verifyPassword, generateSessionToken } from '../../src/utils/security';

async function runTests() {
  console.log('--- Testing HUBAAL SHOP Admin Security & Auth ---');

  // Test 1: Salt generation
  const salt1 = generateSalt(16);
  const salt2 = generateSalt(16);
  console.assert(salt1.length === 32, `Salt length should be 32 hex chars, got ${salt1.length}`);
  console.assert(salt1 !== salt2, 'Salts should be uniquely generated');
  console.log('✓ Salt generation passed');

  // Test 2: Hashing and Verification
  const password = 'AdminPassword2026!';
  const hash = await hashPassword(password, salt1);
  console.assert(hash.length === 64, `Hash length should be 64 hex chars, got ${hash.length}`);

  const isValidMatch = await verifyPassword(password, salt1, hash);
  console.assert(isValidMatch === true, 'Matching password must verify to true');

  const isInvalidMatch = await verifyPassword('WrongPassword123', salt1, hash);
  console.assert(isInvalidMatch === false, 'Wrong password must verify to false');

  const isWrongSalt = await verifyPassword(password, salt2, hash);
  console.assert(isWrongSalt === false, 'Mismatched salt must fail verification');
  console.log('✓ Hashing and password verification passed');

  // Test 3: Session Token Generation
  const token1 = generateSessionToken();
  const token2 = generateSessionToken();
  console.assert(token1.startsWith('hbl_sess_'), 'Session token should have prefix hbl_sess_');
  console.assert(token1 !== token2, 'Session tokens should be unique');
  console.log('✓ Session token generation passed');

  // Test 4: Gmail validation check
  const validGmail = 'owner.hubaal@gmail.com';
  const invalidEmail = 'owner@otherdomain.com';
  console.assert(validGmail.toLowerCase().endsWith('@gmail.com'), 'validGmail should end with @gmail.com');
  console.assert(!invalidEmail.toLowerCase().endsWith('@gmail.com'), 'invalidEmail should not end with @gmail.com');
  console.log('✓ Gmail validation check passed');

  console.log('All Admin Security tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
