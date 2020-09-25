const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')
const { paginate } = require('@orbiting/backend-modules-utils')

const accessRoles = ['member']
const adminRoles = ['admin', 'supporter']

const canAccess = (user, context) => {
  const { user: me } = context
  return (
    (Roles.userIsMe(user, me) && Roles.userIsInRoles(user, accessRoles)) ||
    Roles.userIsInRoles(me, adminRoles)
  )
}

module.exports = {
  collections(user, args, context) {
    if (canAccess(user, context)) {
      return Collection.findForUser(user.id, context)
    }
    return []
  },
  collection(user, { name }, context) {
    if (canAccess(user, context)) {
      return Collection.byNameForUser(name, user.id, context)
    }
  },
  async collectionItems(user, args, context) {
    if (canAccess(user, context)) {
      const items = await Collection.findDocumentItemsByCollectionNames(
        {
          ...args,
          userId: user.id,
        },
        context,
      )
      return paginate(args, items)
    }
    return paginate(args, [])
  },
}
