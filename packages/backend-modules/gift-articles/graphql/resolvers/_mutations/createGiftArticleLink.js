const crypto = require('crypto')
const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { ensureUserHasRole } = require('@orbiting/backend-modules-auth/lib/Roles')
const {
  MAX_GIFTS_PER_MONTH,
  GIFT_LINK_TTL_DAYS,
} = require('../../../lib/allowance')

const { FRONTEND_BASE_URL } = process.env

module.exports = async (_, { documentPath }, context) => {
  const { req, pgdb, user: me } = context

  ensureSignedIn(req)
  ensureUserHasRole(me, 'member')

  if (!documentPath || !documentPath.startsWith('/')) {
    throw new Error('Ungültiger Dokumentpfad.')
  }

  const tx = await pgdb.transactionBegin()
  try {
    // Advisory lock on user to prevent concurrent gift creation races
    await tx.query(
      `SELECT pg_advisory_xact_lock(hashtext(:lockKey))`,
      { lockKey: `gift-article:${me.id}` },
    )

    const existingRows = await tx.query(
      `SELECT *
       FROM "giftArticleLinks"
       WHERE "granterUserId" = :userId
         AND "documentPath" = :documentPath
         AND "createdAt" >= date_trunc('month', now())
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      { userId: me.id, documentPath },
    )

    if (existingRows[0]) {
      await tx.transactionCommit()
      return formatLink(existingRows[0])
    }

    const count = await tx.queryOneField(
      `SELECT COUNT(DISTINCT "documentPath")::int
       FROM "giftArticleLinks"
       WHERE "granterUserId" = :userId
         AND "createdAt" >= date_trunc('month', now())`,
      { userId: me.id },
    )

    if ((count || 0) >= MAX_GIFTS_PER_MONTH) {
      await tx.transactionCommit()
      throw new Error(
        `Sie haben diesen Monat bereits alle ${MAX_GIFTS_PER_MONTH} Geschenk-Artikel aufgebraucht.`,
      )
    }

    const token = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(
      now.getTime() + GIFT_LINK_TTL_DAYS * 24 * 60 * 60 * 1000,
    )

    const row = await tx.public.giftArticleLinks.insertAndGet({
      granterUserId: me.id,
      documentPath,
      token,
      expiresAt,
    })

    await tx.transactionCommit()
    return formatLink(row)
  } catch (err) {
    await tx.transactionRollback()
    throw err
  }
}

function formatLink(row) {
  return {
    id: row.id,
    token: row.token,
    url: `${FRONTEND_BASE_URL}${row.documentPath}?gift=${row.token}`,
    documentPath: row.documentPath,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  }
}
