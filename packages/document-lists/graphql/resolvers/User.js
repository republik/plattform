const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../lib/DocumentList')

module.exports = {
  documentLists (_, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member'])) {
      return []
    }
    return DocumentList.findForUser(me.id, context)
  },
  documentList (_, { name }, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member'])) {
      return []
    }
    return DocumentList.byNameForUser(name, me.id, context)
  }
}
