const crypto = require('crypto')
const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  GIFT_LINK_TTL_DAYS,
  toStoredDocumentId,
  formatLink,
} = require('../../../lib/links')

module.exports = async (_, { documentId, documentPath }, context) => {
  const { req, pgdb, user: me } = context

  ensureSignedIn(req)
  Roles.ensureUserHasRole(me, 'member')

  const sanityId = toStoredDocumentId(documentId)
  if (!sanityId) {
    throw new Error('Ungültige Dokument-ID.')
  }
  if (!documentPath || !documentPath.startsWith('/')) {
    throw new Error('Ungültiger Dokumentpfad.')
  }

  const tx = await pgdb.transactionBegin()
  try {
    // Two menus opened at once (say, the top and the floating action bar) would
    // otherwise both miss the SELECT below and insert a link each, leaving the
    // article with two live tokens and the granter with whichever one the
    // second render happened to show.
    await tx.query(`SELECT pg_advisory_xact_lock(hashtext(:lockKey))`, {
      lockKey: `gift-article:${me.id}`,
    })

    // Sharing the same article twice hands out the same link rather than a
    // second one — but only while it is still live: once it has run out, the
    // granter gets a fresh 14 days instead of a link that is already dead.
    const [existing] = await tx.query(
      `SELECT *
         FROM "giftArticleLinks"
        WHERE "granterUserId" = :userId
          AND "documentId" = :sanityId
          AND "expiresAt" > now()
        ORDER BY "createdAt" DESC
        LIMIT 1`,
      { userId: me.id, sanityId },
    )

    if (existing) {
      await tx.transactionCommit()
      return formatLink(existing)
    }

    const row = await tx.public.giftArticleLinks.insertAndGet({
      granterUserId: me.id,
      documentId: sanityId,
      documentPath,
      token: crypto.randomUUID(),
      expiresAt: new Date(
        Date.now() + GIFT_LINK_TTL_DAYS * 24 * 60 * 60 * 1000,
      ),
    })

    await tx.transactionCommit()
    return formatLink(row)
  } catch (err) {
    await tx.transactionRollback()
    throw err
  }
}
