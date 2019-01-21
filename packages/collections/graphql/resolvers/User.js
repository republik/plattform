const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')
const Progress = require('../../lib/Progress')

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
  },
  trackProgress (user, args, context) {
    const { user: me } = context
    if (Roles.userIsMe(user, me) || Roles.userIsInRoles(me, adminRoles)) {
      return Progress.status(user.id, context)
    }
  }
}
