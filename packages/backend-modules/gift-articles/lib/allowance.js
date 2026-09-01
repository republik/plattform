const GIFT_LINK_TTL_DAYS = 14

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
  GIFT_LINK_TTL_DAYS,
  findExistingLink,
}
