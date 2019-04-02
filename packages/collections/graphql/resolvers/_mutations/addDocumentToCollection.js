const { Roles } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')

module.exports = async (_, { documentId, collectionName, data }, context) => {
  const { user: me, t, loaders } = context
  Roles.ensureUserHasRole(me, 'member')

  const collection = await Collection.byNameForUser(collectionName, me.id, context)
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  const repoId = Buffer.from(documentId, 'base64')
    .toString('utf-8')
    .split('/')
    .slice(0, 2)
    .join('/')
  const doc = await loaders.Document.byRepoId.load(repoId)
  if (!doc) {
    throw new Error(t(`api/collections/document/404`))
  }

  const item = await Collection.upsertDocumentItem(
    me.id,
    collection.id,
    repoId,
    data,
    context
  )

  return item
}
