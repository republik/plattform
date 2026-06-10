const createCache = require('@orbiting/backend-modules-republik-crowdfundings/lib/cache')
const { DISABLE_RESOLVER_USER_CACHE } = process.env

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 4 // 4 hours

const getCache = (questionnaireId, args) =>
  createCache(
    {
      prefix: `questionnaire:${questionnaireId}`,
      key: `questions`,
      ttl: QUERY_CACHE_TTL_SECONDS,
      disabled: DISABLE_RESOLVER_USER_CACHE,
    },
    args,
  )

module.exports = {
  getCache,
}
