/**
 * @typedef {Object} GatewayClient
 * @property {string} name - The name of the client.
 * @property {string} token - The token of the client.
 */

const { timingSafeEqual } = require('node:crypto')

const HEADER_TOKEN = 'x-api-gateway-token'
const HEADER_CLIENT = 'x-api-gateway-client'

// "enforce" (default) — reject invalid requests with 403
// "logging" — log warnings but allow all requests through
const GATEWAY_MODE =
  process.env.API_GATEWAY_MODE === 'logging' ? 'logging' : 'enforce'

// Clients are configured via a single JSON env var:
// API_GATEWAY_CLIENTS='[{"name":"www","token":"abc..."},{"name":"admin","token":"def..."}]'
const GATEWAY_TOKENS = (() => {
  try {
    const clients = JSON.parse(process.env.API_GATEWAY_CLIENTS || '[]')
    return Object.fromEntries(clients.map((c) => [c.name, c.token]))
  } catch (e) {
    console.error('Failed to parse API_GATEWAY_CLIENTS:', e)
    return {}
  }
})()

// Paths that don't require the gateway token
const PUBLIC_PATHS = [
  '/healthz',
  '/graphiql',
  '/webhooks/',
  '/webhook/',
  '/mail/',
  '/publikator/uncommittedChanges',
  '/publikator/webhook/',
  '/invoices/',
  '/payments/',
]

function isPublicPath(path) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p))
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

function gatewayGuard(req, res, next) {
  if (isPublicPath(req.path)) {
    return next()
  }

  if (Object.keys(GATEWAY_TOKENS).length === 0) {
    return next()
  }

  const client = req.headers[HEADER_CLIENT]
  const token = req.headers[HEADER_TOKEN]

  if (!client || !token) {
    req.log.warn(
      { path: req.path, client: client ?? 'none' }`Gateway: missing headers`,
    )
    if (GATEWAY_MODE === 'enforce') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    return next()
  }

  const expectedToken = GATEWAY_TOKENS[client]
  if (!expectedToken || !safeEqual(token, expectedToken)) {
    req.log.error(
      { path: req.path, client: client ?? 'none' }`Gateway: invalid token`,
    )
    if (GATEWAY_MODE === 'enforce') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    return next()
  }

  req.gatewayClient = client
  next()
}

module.exports = { gatewayGuard }
