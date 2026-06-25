const MAX_GIFTS_PER_MONTH = 10
const GIFT_LINK_TTL_DAYS = 14

async function getMonthlyGiftCount(pgdb, userId) {
  const result = await pgdb.queryOneField(
    `SELECT COUNT(DISTINCT "documentPath")::int
     FROM "giftArticleLinks"
     WHERE "granterUserId" = :userId
       AND "createdAt" >= date_trunc('month', now())`,
    { userId },
  )
  return result || 0
}

async function findExistingLink(pgdb, userId, documentPath) {
  const rows = await pgdb.query(
    `SELECT *
     FROM "giftArticleLinks"
     WHERE "granterUserId" = :userId
       AND "documentPath" = :documentPath
       AND "createdAt" >= date_trunc('month', now())
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    { userId, documentPath },
  )
  return rows[0] || null
}

module.exports = {
  MAX_GIFTS_PER_MONTH,
  GIFT_LINK_TTL_DAYS,
  getMonthlyGiftCount,
  findExistingLink,
}
