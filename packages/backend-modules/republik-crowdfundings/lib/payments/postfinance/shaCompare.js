const crypto = require('crypto')

/**
 * Constant-time comparison of a received SHASIGN with the expected one.
 * Both are uppercase hex strings; no case normalization is applied (same
 * strictness as the former `!==`). Missing/non-string/length-mismatching
 * values never match.
 */
module.exports = (received, expected) => {
  if (typeof received !== 'string' || typeof expected !== 'string') {
    return false
  }
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  // timingSafeEqual throws on different lengths. The length of the expected
  // SHA-1 hex digest is public, so returning early leaks nothing.
  if (a.length !== b.length) {
    return false
  }
  return crypto.timingSafeEqual(a, b)
}
