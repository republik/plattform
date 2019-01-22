const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

const accessRoles = ['member']
const adminRoles = ['admin', 'supporter']

module.exports = {
  collections (user, args, context) {
    const { user: me } = context
    if (
      (Roles.userIsMe(user, me) && Roles.userIsInRoles(user, accessRoles)) ||
      Roles.userIsInRoles(me, adminRoles)
    ) {
      return Collection.findForUser(user.id, context)
    }
    return []
  },
  collection (user, { name }, context) {
    const { user: me } = context
    if (
      (Roles.userIsMe(user, me) && Roles.userIsInRoles(user, accessRoles)) ||
      Roles.userIsInRoles(me, adminRoles)
    ) {
      return Collection.byNameForUser(name, user.id, context)
    }
  }
}
