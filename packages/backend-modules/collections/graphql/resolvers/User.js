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
      let items = await Collection.findDocumentItemsByCollectionNames(
        {
          ...args,
          userId: user.id,
        },
        context,
      )
      if (args.uniqueDocuments) {
        items = items.filter(
          (a, index, all) =>
            index === all.findIndex((b) => b.repoId === a.repoId),
        )
      }
      if (args.excludeRepoId) {
        items = items.filter(
          (item) => args.excludeRepoId !== item.repoId
        )
      }
      return paginate(args, items)
    }
    return paginate(args, [])
  },
  async audioQueue(user, args, context) {
    if (canAccess(user, context)) {
      const items = await context.loaders.AudioQueue.byUserId.load(user.id)
      // publikator items only, like `Collection.items`. A Sanity-backed item
      // resolves `document` to null, and the web player treats an item without
      // `document.meta.audioSource` as corrupt and calls removeAudioQueueItem on
      // it — so surfacing them here would delete them. They are served by the
      // `userAudioQueue` query instead.
      return items.filter(({ repoId }) => repoId)
    }

    return null
  },
}
