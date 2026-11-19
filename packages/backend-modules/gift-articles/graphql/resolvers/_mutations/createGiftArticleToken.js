const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  isSanityRef,
  fromSanityRef,
  publishedIdFor,
} = require('@orbiting/backend-modules-sanity')
const { createGiftToken } = require('../../../lib/links')

module.exports = async (_, { documentId }, context) => {
  const { req, user: me } = context

  ensureSignedIn(req)
  Roles.ensureUserHasRole(me, 'member')

  if (!isSanityRef(documentId)) {
    throw new Error('Ungültige Dokument-ID.')
  }

  const sanityId = publishedIdFor(fromSanityRef(documentId))
  if (!sanityId) {
    throw new Error('Ungültige Dokument-ID.')
  }

  return createGiftToken({ documentId: sanityId })
}
