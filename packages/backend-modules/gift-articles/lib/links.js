const {
  isSanityRef,
  fromSanityRef,
  toSanityRef,
  publishedId,
} = require('@orbiting/backend-modules-sanity')

const { FRONTEND_BASE_URL } = process.env

const GIFT_LINK_TTL_DAYS = 14

// Stored form of the article reference: the bare, published Sanity `_id`, the
// same value `collectionDocumentItems."sanityId"` holds. The client sends the
// `sanity:`-prefixed ref its `collectionsDocumentId()` builds, and a preview
// reader would send the `drafts.`-prefixed id of the very same article — both
// have to collapse onto one key, or a gift link would depend on how the
// granter happened to open the piece.
const toStoredDocumentId = (input) =>
  publishedId(isSanityRef(input) ? fromSanityRef(input) : input)

const formatLink = (row) => ({
  id: row.id,
  token: row.token,
  url: `${FRONTEND_BASE_URL}${row.documentPath}?gift=${row.token}`,
  documentId: toSanityRef(row.documentId),
  documentPath: row.documentPath,
  createdAt: row.createdAt,
  expiresAt: row.expiresAt,
})

module.exports = {
  GIFT_LINK_TTL_DAYS,
  toStoredDocumentId,
  formatLink,
}
