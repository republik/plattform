const { cache: { create: createCache } } = require('@orbiting/backend-modules-utils')

const CACHE_TTL_SECONDS = 5 * 60 // 5 minutes

export async function checkIpAllowlist(
  clientIp: string,
  pgdb: any,
  redis: any
): Promise<{ name: string } | null> {
  if (!clientIp) {
    return null
  }

  const cacheInstance = createCache(
    {
      namespace: 'allowlist',
      prefix: 'ip',
      key: clientIp,
      ttl: CACHE_TTL_SECONDS,
    },
    { redis }
  )

  return cacheInstance.cache(async () => {
    const result = await pgdb.query(
      `
      SELECT name FROM "ipAllowlist"
      WHERE active = true
      AND $1::inet <<= ANY("ipRanges")
      LIMIT 1
    `,
      [clientIp]
    )
    return result.length > 0 ? result[0] : null
  })
}

