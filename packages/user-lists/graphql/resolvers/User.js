const { Roles } = require('@orbiting/backend-modules-auth')
const UserList = require('../../lib/UserList')

module.exports = {
  lists (user, args, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return []
    }
    return UserList.findForUser(user.id, context)
  },
  list (user, { name }, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return
    }
    return UserList.byNameForUser(name, user.id, context)
  }
}
