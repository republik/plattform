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
    // Serializes one member's link creation, so two action bars on the same
    // page can't both miss the SELECT below and insert a link each.
    await tx.query(`SELECT pg_advisory_xact_lock(hashtext(:lockKey))`, {
      lockKey: `gift-article:${me.id}`,
    })

    // Sharing the same article again hands out the same link while it is
    // still live; once it has run out, the next share mints a fresh one.
    const [existing] = await tx.query(
      `SELECT *
         FROM gift_article_links
        WHERE granter_user_id = :userId
          AND document_id = :sanityId
          AND expires_at > now()
        ORDER BY created_at DESC
        LIMIT 1`,
      { userId: me.id, sanityId },
    )

    if (existing) {
      await tx.transactionCommit()
      return formatLink(existing)
    }

    const row = await tx.public.gift_article_links.insertAndGet({
      granter_user_id: me.id,
      document_id: sanityId,
      document_path: documentPath,
      token: crypto.randomUUID(),
      expires_at: new Date(
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
