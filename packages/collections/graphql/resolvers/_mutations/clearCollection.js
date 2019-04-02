const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { collectionName }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(collectionName, me.id, context)
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  await Collection.clearItems(
    me.id,
    collection.name,
    context
  )

  return collection
}
