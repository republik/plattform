const {
  isSanityRef,
  fromSanityRef,
  toSanityRef,
  publishedId,
} = require('@orbiting/backend-modules-sanity')

const { FRONTEND_BASE_URL } = process.env

const GIFT_LINK_TTL_DAYS = 14

// Normalises a client-supplied reference to the stored form: the bare,
// published Sanity `_id`, the same value `collectionDocumentItems."sanityId"`
// holds. Accepts the `sanity:`-prefixed ref `collectionsDocumentId()` builds
// and the `drafts.`-prefixed id a preview reader sends.
const toStoredDocumentId = (input) =>
  publishedId(isSanityRef(input) ? fromSanityRef(input) : input)

// Row columns are snake_case (see the migration); the GraphQL type is not.
const formatLink = (row) => ({
  id: row.id,
  token: row.token,
  url: `${FRONTEND_BASE_URL}${row.document_path}?gift=${row.token}`,
  documentId: toSanityRef(row.document_id),
  documentPath: row.document_path,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
})

module.exports = {
  GIFT_LINK_TTL_DAYS,
  toStoredDocumentId,
  formatLink,
}
