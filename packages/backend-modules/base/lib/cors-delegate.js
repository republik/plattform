const originRegex = /^(https?:\/\/)?/i
// TODO: ensure domain is not 'https://*.' or 'http://*.'
const wildcardOriginRegex = /^(https?:\/\/\*\.)/

/**
 * Check if the origin matches the wildcard domain.
 * @param {string} origin of the request
 * @param {string} wildcardDomain with a wildcard prefix '*.'
 * @returns {boolean} the origin matches the wildcard domain
 */
function matchWildcardDomain(origin, wildcardDomain) {
  // should have the same number of domain parts
  const getParts = (domain) => domain.replace(/^https?:\/\//, '').split('.')
  const originParts = getParts(origin)
  const wildcardParts = getParts(wildcardDomain)

  if (originParts.length < wildcardParts.length) {
    return false
  }

  // walk through the domain parts from right to left
  // and check if the origin matches the wildcard domain
  for (let i = wildcardParts.length - 1; i >= 0; i--) {
    // if the '*.' part of a wildcard domain is reached, the origin matches
    if (wildcardParts[i] === '*') {
      break
    }
    if (originParts[i] !== wildcardParts[i]) {
      return false
    }
  }

  return true
}

/**
 * Create a CORS delegate function that checks if the origin is in the allow list,
 * or if the origin belongs to a wildcard domain in the allow list.
 *
 * The corsAllowList should consist of an array of domains and wildcard domains.
 * - Domains should start with 'http://' or 'https://'.
 * - Wildcard domains should start with '*.'.
 *
 * Details of CORS delegate function:
 *   https://www.npmjs.com/package/cors#configuring-cors-asynchronously
 *
 * @param {Array<string>} corsAllowList
 * @param {import('cors').CorsOptions} corsOptions
 * @returns {import('cors').CorsOptionsDelegate}
 */
function makeCorsOptionsDelegateFunc(corsAllowList, corsOptions) {
  const domainAllowList = corsAllowList.filter(
    (domain) => originRegex.test(domain) && !wildcardOriginRegex.test(domain),
  )
  const wildcardDomainAllowList = corsAllowList.filter((domain) =>
    wildcardOriginRegex.test(domain),
  )

  return function corsDelegate(req, callback) {
    const origin = req.headers.origin

    if (domainAllowList.includes(origin)) {
      return callback(null, {
        ...corsOptions,
        origin: [...domainAllowList],
      })
    }

    if (
      wildcardDomainAllowList.some((wildcardDomain) => {
        const domainMatches = matchWildcardDomain(origin, wildcardDomain)
        return domainMatches
      })
    ) {
      return callback(null, {
        ...corsOptions,
        // return the domain list as well as the origin that matched a wildcard domain
        origin: [...domainAllowList, origin],
      })
    }

    return callback(new Error('Not allowed by CORS'), corsOptions)
  }
}

module.exports = {
  makeCorsOptionsDelegateFunc,
}
