const { toSanityRef } = require('@orbiting/backend-modules-sanity')

// Shown in place of the granter's name when they don't have a public profile.
const ANONYMOUS_GRANTER = 'Ein Republik-Mitglied'

// Public: recipients redeem links without an account.
module.exports = async (_, { token }, { pgdb }) => {
  // gift_article_links is snake_case, users is not: the granter's columns are
  // aliased so one row doesn't come back in two naming conventions.
  const [row] = await pgdb.query(
    `SELECT g.document_id,
            g.document_path,
            g.expires_at,
            u."firstName" AS granter_first_name,
            u."lastName" AS granter_last_name,
            u."hasPublicProfile" AS granter_has_public_profile,
            u."portraitUrl" AS granter_portrait_url
       FROM gift_article_links g
       JOIN users u ON u.id = g.granter_user_id
      WHERE g.token = :token
      LIMIT 1`,
    { token },
  )

  if (!row) {
    return null
  }

  const valid = new Date(row.expires_at) > new Date()

  return {
    valid,
    // Reported whether or not the link is live, so the frontend can tell
    // "this one ran out" from "this one is for another article".
    documentId: toSanityRef(row.document_id),
    documentPath: row.document_path,
    expiresAt: row.expires_at,
    granter: !valid
      ? null
      : row.granter_has_public_profile
      ? {
          name: [row.granter_first_name, row.granter_last_name]
            .filter(Boolean)
            .join(' '),
          portrait: row.granter_portrait_url || null,
          hasPublicProfile: true,
        }
      : {
          name: ANONYMOUS_GRANTER,
          portrait: null,
          hasPublicProfile: false,
        },
  }
}
