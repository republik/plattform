/**
 * Resolve the real client IP behind a known number of trusted reverse proxies.
 *
 * Every proxy APPENDS the address of its peer to X-Forwarded-For. Anything a
 * client sends in that header stays on the left, so the leftmost entry is
 * attacker controlled. Only the entries added by our own proxies (counted
 * from the right) can be trusted.
 *
 * Production runs behind exactly one proxy (the Heroku router), so by default
 * the client is the LAST X-Forwarded-For entry. Override with the
 * TRUST_PROXY_HOPS env variable (0 = no proxy, use the socket address).
 * In development there is no proxy and the socket address is used.
 */

const DEFAULT_PROD_HOPS = 1

const parseHops = (value, fallback) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback
  }
  const hops = Number(value)
  return Number.isInteger(hops) && hops >= 0 ? hops : fallback
}

const getTrustProxyHops = (env = process.env) =>
  parseHops(
    env.TRUST_PROXY_HOPS,
    env.NODE_ENV === 'production' ? DEFAULT_PROD_HOPS : 0,
  )

const normalize = (ip) => {
  if (!ip) {
    return null
  }
  const trimmed = String(ip).trim()
  if (!trimmed) {
    return null
  }
  // IPv4-mapped IPv6 (::ffff:1.2.3.4)
  return trimmed.replace(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i, '$1')
}

const parseForwardedFor = (header) => {
  const values = Array.isArray(header) ? header : [header]
  return values
    .filter((v) => typeof v === 'string')
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean)
}

/**
 * @param {object} args
 * @param {string|string[]} [args.forwardedFor] raw X-Forwarded-For header
 * @param {string} [args.remoteAddress] socket address (the nearest peer)
 * @param {number} [args.hops] number of trusted proxies in front of the app
 * @returns {string|null}
 */
const resolveClientIp = ({
  forwardedFor,
  remoteAddress,
  hops = getTrustProxyHops(),
}) => {
  const entries = parseForwardedFor(forwardedFor)
  if (hops <= 0 || entries.length === 0) {
    return normalize(remoteAddress)
  }
  return normalize(entries[Math.max(0, entries.length - hops)])
}

/**
 * Client IP of an express/http request.
 */
const getClientIp = (req, hops = getTrustProxyHops()) =>
  resolveClientIp({
    forwardedFor: req?.headers?.['x-forwarded-for'],
    remoteAddress: req?.socket?.remoteAddress || req?.connection?.remoteAddress,
    hops,
  })

module.exports = { getClientIp, resolveClientIp, getTrustProxyHops }
