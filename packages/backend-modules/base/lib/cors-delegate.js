const domainRegex = /^https?:\/\/?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,6}$/i
const wildcardDomainRegex =
  /^https?:\/\/?\*\.[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,6}$/i

/**
 * Check if the origin matches the wildcard domain.
 * @param {string} domain
 * @param {string} wildcardDomain with a wildcard prefix '*.'
 * @returns {boolean} does the domain matches the wildcard domain
 */
function matchWildcardDomain(domain, wildcardDomain) {
  // should have the same number of domain parts
  const getParts = (domain) =>
    domain
      .replace(/^https?:\/\//, '')
      .split('.')
      .reverse()
  const originParts = getParts(domain)
  const wildcardParts = getParts(wildcardDomain)

  if (originParts.length < wildcardParts.length) {
    return false
  }

  // walk through the domain parts from right to left
  // and check if the origin matches the wildcard domain
  for (let i = 0; i < wildcardParts.length; i++) {
    // if the '*.' part of a wildcard domain is reached, the origin matches
    if (wildcardParts[i] === '*') {
      break
    }
    if (originParts?.[i] !== wildcardParts[i]) {
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
    (domain) => domainRegex.test(domain) && !wildcardDomainRegex.test(domain),
  )
  const wildcardDomainAllowList = corsAllowList.filter((domain) =>
    wildcardDomainRegex.test(domain),
  )

  return function corsDelegate(req, callback) {
    const origin = req.headers.origin

    if (domainAllowList.includes(origin)) {
      return callback(null, {
        ...corsOptions,
        origin: true,
      })
    }

    if (
      wildcardDomainAllowList.some((wildcardDomain) =>
        matchWildcardDomain(origin, wildcardDomain),
      )
    ) {
      return callback(null, {
        ...corsOptions,
        origin: true,
      })
    }

    return callback(new Error('Not allowed by CORS'), corsOptions)
  }
}

module.exports = {
  makeCorsOptionsDelegateFunc,
}
