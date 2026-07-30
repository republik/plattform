import { timingSafeEqual } from 'crypto'

/**
 * Constant-time string comparison for secrets (bearer tokens, HMAC
 * signatures). `timingSafeEqual` throws on length mismatch, so the lengths
 * are checked first -- which does leak length, but not content.
 */
export const safeCompare = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) {
    return false
  }
  return timingSafeEqual(bufferA, bufferB)
}
