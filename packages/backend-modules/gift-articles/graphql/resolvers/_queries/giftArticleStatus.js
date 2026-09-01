const { findExistingLink } = require('../../../lib/allowance')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, { documentPath }, context) => {
  const { user: me, pgdb } = context

  if (!me) {
    return {
      existingLink: null,
    }
  }

  const existing = await findExistingLink(pgdb, me.id, documentPath)

  return {
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
