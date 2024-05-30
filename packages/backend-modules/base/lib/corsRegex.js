const debug = require('debug')('base:server:cors')

function wildcardToRegex(pattern) {
  const escapedPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\*/g, '.*')
  return new RegExp(`^${escapedPattern}$`)
}

const LOCALHOST_ORIGIN =
  /https?:\/\/(?:localhost|127\.0\.0\.1|::1)(?::\d{1,5})?/

function createCORSMatcher(allowedOrigins) {
  const regexPatterns = allowedOrigins.map(wildcardToRegex)

  return (origin, callback) => {
    if (!origin) {
      debug(`allowing non web request`)
      // Allow non-origin requests (like mobile apps, curl requests, etc.) and request from localhost
      return callback(null, true)
    }
    if (LOCALHOST_ORIGIN.test(origin)) {
      debug(`allowing request from local origin [${origin}]`)
      // Allow non-origin requests (like mobile apps, curl requests, etc.) and request from localhost
      return callback(null, true)
    }

    debug(
      `checking [${origin}] against CORS allow list ${JSON.stringify(
        regexPatterns.map((r) => r.toString()),
        null,
        2,
      )}`,
    )

    const originIsAllowed = regexPatterns.some((regex) => {
      const itMatches = regex.test(origin)
      debug(
        `origin [${origin}] ${
          itMatches ? 'matches' : 'does not match'
        } [${regex}]`,
      )
      return itMatches
    })
    if (originIsAllowed) {
      return callback(null, true)
    }

    return callback(
      new Error(`Origin ${origin} not allowed by CORS ${allowedOrigins}`),
    )
  }
}

module.exports = {
  createCORSMatcher,
}
