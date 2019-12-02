const { Roles } = require('@orbiting/backend-modules-auth')
const documents = require('./_queries/documents')
const emptyDocumentConnection = require('../../lib/emptyDocumentConnection')

module.exports = {
  documents (user, args, context, info) {
    const { user: me } = context
    if (Roles.userIsMeOrProfileVisible(user, me)) {
      return documents(user, {
        ...args,
        userId: user.id
      }, context, info)
    }
    return emptyDocumentConnection
  }
}
