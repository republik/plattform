const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')
const { paginate } = require('@orbiting/backend-modules-utils')

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
  async collectionItems (user, args, context) {
    const { user: me } = context
    if (
      (Roles.userIsMe(user, me) && Roles.userIsInRoles(user, accessRoles)) ||
      Roles.userIsInRoles(me, adminRoles)
    ) {
      const collections = await Promise.all(args.names.map(name => Collection.byNameForUser(name, user.id, context)))
      const items = await Collection.findDocumentItems(
        {
          collectionId: collections.map(collection => collection.id),
          userId: user.id
        },
        context
      )
      return paginate(args, items)
    }
  }
}
