module.exports = async (_, { token }, { pgdb }) => {
  const rows = await pgdb.query(
    `SELECT g.*, u."firstName", u."lastName", u."hasPublicProfile", u."portraitUrl"
     FROM "giftArticleLinks" g
     JOIN users u ON u.id = g."granterUserId"
     WHERE g.token = :token
     LIMIT 1`,
    { token },
  )

  const row = rows[0]
  if (!row) {
    return null
  }

  const now = new Date()
  const valid = new Date(row.expiresAt) > now

  if (!valid) {
    return { valid: false, documentPath: null, expiresAt: null, granter: null }
  }

  let granter = null
  if (row.hasPublicProfile) {
    granter = {
      name: [row.firstName, row.lastName].filter(Boolean).join(' '),
      portrait: row.portraitUrl || null,
      hasPublicProfile: true,
    }
  } else {
    granter = {
      name: 'Ein Republik-Mitglied',
      portrait: null,
      hasPublicProfile: false,
    }
  }

  return {
    valid: true,
    documentPath: row.documentPath,
    expiresAt: row.expiresAt,
    granter,
  }
}
