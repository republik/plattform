const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

module.exports = {
  async userCollectionItems({ meta: { repoId } }, args, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !repoId) {
      return []
    }
    return Collection.findDocumentItems(
      {
        repoId,
        userId: me.id,
      },
      context,
    )
  },
  async userCollectionItem({ meta: { repoId } }, { collectionName }, context) {
    const { user: me } = context
    if (!Roles.userIsInRoles(me, ['member']) || !repoId) {
      return
    }
    return Collection.getDocumentItem(
      {
        repoId,
        userId: me.id,
        collectionName,
      },
      context,
    )
  },
  userProgress({ meta: { repoId } }, _args, context) {
    const { user: me } = context

    if (!repoId || !me) {
      return
    }

    return Collection.getDocumentProgressItem(
      {
        repoId,
        userId: me.id,
      },
      context,
    )
  },
}
