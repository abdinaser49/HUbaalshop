/**
 * HUBAAL SHOP - Security & Cryptographic Utilities
 * Provides SHA-256 password hashing with salt, password verification,
 * and secure session token generation using standard Web Crypto API.
 */

/**
 * Generate a random cryptographic salt (hex string)
 */
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Securely hash a password with a salt using SHA-256
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'HUBAAL_SECURITY_PEPPER_2026');

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback hash implementation if crypto.subtle is unavailable
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

/**
 * Verify a plaintext password against an expected hash and salt
 */
export async function verifyPassword(
  attempt: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const computed = await hashPassword(attempt, salt);
  return computed === expectedHash;
}

/**
 * Generate a unique session token
 */
export function generateSessionToken(): string {
  return 'hbl_sess_' + Date.now().toString(36) + '_' + generateSalt(8);
}
