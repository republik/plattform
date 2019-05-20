const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, collectionName }, context) => {
  const { user: me, t, req } = context
  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(collectionName, me.id, context)
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  const repoId = Buffer.from(documentId, 'base64')
    .toString('utf-8')
    .split('/')
    .slice(0, 2)
    .join('/')
  const item = await Collection.deleteDocumentItem(
    me.id,
    collection.id,
    repoId,
    context
  )

  return item
}
