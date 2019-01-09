const { Roles } = require('@orbiting/backend-modules-auth')
const DocumentList = require('../../lib/DocumentList')

module.exports = {
  documentLists (user, args, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return []
    }
    return DocumentList.findForUser(user.id, context)
  },
  documentList (user, { name }, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return
    }
    return DocumentList.byNameForUser(name, user.id, context)
  }
}
