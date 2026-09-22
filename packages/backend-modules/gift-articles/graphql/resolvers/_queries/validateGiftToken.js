const { toSanityRef } = require('@orbiting/backend-modules-sanity')

// Shown in place of the granter's name when they don't have a public profile.
const ANONYMOUS_GRANTER = 'Ein Republik-Mitglied'

// Public on purpose: the whole point of a gift link is that the recipient can
// open it without an account.
module.exports = async (_, { token }, { pgdb }) => {
  const [row] = await pgdb.query(
    `SELECT g.*, u."firstName", u."lastName", u."hasPublicProfile", u."portraitUrl"
       FROM "giftArticleLinks" g
       JOIN users u ON u.id = g."granterUserId"
      WHERE g.token = :token
      LIMIT 1`,
    { token },
  )

  if (!row) {
    return null
  }

  const valid = new Date(row.expiresAt) > new Date()

  return {
    valid,
    // Which article the link unlocks is stated either way: the frontend needs
    // it to tell "this link ran out" from "this link is for another article",
    // and the recipient is looking at the article regardless.
    documentId: toSanityRef(row.documentId),
    documentPath: row.documentPath,
    expiresAt: row.expiresAt,
    granter: !valid
      ? null
      : row.hasPublicProfile
      ? {
          name: [row.firstName, row.lastName].filter(Boolean).join(' '),
          portrait: row.portraitUrl || null,
          hasPublicProfile: true,
        }
      : {
          name: ANONYMOUS_GRANTER,
          portrait: null,
          hasPublicProfile: false,
        },
  }
}
