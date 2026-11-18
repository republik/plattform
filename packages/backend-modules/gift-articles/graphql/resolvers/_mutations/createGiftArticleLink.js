const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { toStoredDocumentId, createGiftLink } = require('../../../lib/links')

// Stateless: the link is a signed token, nothing is stored. Signing has to
// happen here, behind the role check, because the private key must stay on
// the server; anyone holding it could unlock any article.
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
