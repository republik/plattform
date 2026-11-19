const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { toStoredDocumentId, createGiftToken } = require('../../../lib/links')

module.exports = async (_, { documentId }, context) => {
  const { req, user: me } = context

  ensureSignedIn(req)
  Roles.ensureUserHasRole(me, 'member')

  const sanityId = toStoredDocumentId(documentId)
  if (!sanityId) {
    throw new Error('Ungültige Dokument-ID.')
  }

  return createGiftToken({ documentId: sanityId })
}
