import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const keyLength = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, keyLength).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const actual = Buffer.from(hash, 'hex');
  const expected = scryptSync(password, salt, keyLength);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
