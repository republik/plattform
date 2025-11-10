const { Roles } = require('@orbiting/backend-modules-auth')
const { upsertItem, getCollectionName } = require('../../../lib/AudioQueue')
const { ascending } = require('d3-array')

module.exports = async (_, args, context) => {
  const { id, sequence } = args
  const { user: me, loaders, pgdb } = context

  Roles.ensureUserHasRole(me, 'member')

  await upsertItem({ id, sequence }, context)

  // Return only minimal data (IDs and sequences) without loading full documents
  const collection = await loaders.Collection.byKeyObj.load({
    name: getCollectionName(),
  })

  if (!collection) {
    return []
  }

  const items = await pgdb.public.collectionDocumentItems.find(
    {
      collectionId: collection.id,
      userId: me.id,
    },
    { orderBy: ['createdAt'] }
  )

  return items.sort((a, b) => ascending(a.data?.sequence, b.data?.sequence))
}
