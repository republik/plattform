const VALID_CONVERSION_TYPES = ['trial', 'pledge']

async function recordGiftConversion(pgdb, userId, payload, conversionType) {
  if (!payload?.gift_token) return
  if (!VALID_CONVERSION_TYPES.includes(conversionType)) return

  try {
    const rows = await pgdb.query(
      `SELECT id FROM "giftArticleLinks" WHERE token = :token LIMIT 1`,
      { token: payload.gift_token },
    )

    const link = rows[0]
    if (!link) return

    const existing = await pgdb.query(
      `SELECT id FROM "giftArticleConversions"
       WHERE "giftArticleLinkId" = :linkId AND "convertedUserId" = :userId
       LIMIT 1`,
      { linkId: link.id, userId },
    )
    if (existing.length > 0) return

    await pgdb.public.giftArticleConversions.insert({
      giftArticleLinkId: link.id,
      convertedUserId: userId,
      conversionType,
    })
  } catch (err) {
    console.error('gift-articles: failed to record conversion', err)
  }
}

module.exports = { recordGiftConversion }
