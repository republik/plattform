const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

module.exports = {
  collections (user, args, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return []
    }
    return Collection.findForUser(user.id, context)
  },
  collection (user, { name }, context) {
    const { user: me } = context
    if (
      !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      !Roles.userIsInRoles(user, ['member'])
    ) {
      return
    }
    return Collection.byNameForUser(name, user.id, context)
  }
}
