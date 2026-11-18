const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { toStoredDocumentId, createGiftLink } = require('../../../lib/links')

module.exports = async (_, { documentId, documentPath }, context) => {
  const { req, user: me } = context

  ensureSignedIn(req)
  Roles.ensureUserHasRole(me, 'member')

  const sanityId = toStoredDocumentId(documentId)
  if (!sanityId) {
    throw new Error('Ungültige Dokument-ID.')
  }
  if (!documentPath || !documentPath.startsWith('/')) {
    throw new Error('Ungültiger Dokumentpfad.')
  }

  return createGiftLink({ documentId: sanityId, documentPath })
}
