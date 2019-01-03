const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../lib/DocumentList')

module.exports = {
  documentLists (_, args, { user: me, pgdb }) {
    if (!Roles.userIsInRoles(me, ['member'])) {
      return []
    }
    return DocumentList.findForUser(me.id, pgdb)
  },
  documentList (_, { name }, { user: me, pgdb }) {
    if (!Roles.userIsInRoles(me, ['member'])) {
      return []
    }
    return DocumentList.byNameForUser(name, me.id, pgdb)
  }
}
