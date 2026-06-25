const {
  MAX_GIFTS_PER_MONTH,
  getMonthlyGiftCount,
  findExistingLink,
} = require('../../../lib/allowance')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, { documentPath }, context) => {
  const { user: me, pgdb } = context

  if (!me) {
    return {
      remainingGiftsThisMonth: 0,
      maxGiftsPerMonth: MAX_GIFTS_PER_MONTH,
      existingLink: null,
    }
  }

  const count = await getMonthlyGiftCount(pgdb, me.id)
  const existing = await findExistingLink(pgdb, me.id, documentPath)

  return {
    remainingGiftsThisMonth: Math.max(0, MAX_GIFTS_PER_MONTH - count),
    maxGiftsPerMonth: MAX_GIFTS_PER_MONTH,
    existingLink: existing
      ? {
          id: existing.id,
          token: existing.token,
          url: `${FRONTEND_BASE_URL}${existing.documentPath}?gift=${existing.token}`,
          documentPath: existing.documentPath,
          expiresAt: existing.expiresAt,
          createdAt: existing.createdAt,
        }
      : null,
  }
}
