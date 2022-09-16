const createDataLoader = require('@orbiting/backend-modules-dataloader')
const { ascending } = require('d3-array')

module.exports = (context) => ({
  byUserId: createDataLoader(
    async (userIds) => {
      const collection = await context.loaders.Collection.byKeyObj.load({
        name: 'playlist',
      })

      if (!collection) {
        return []
      }

      const items = await context.pgdb.public.collectionDocumentItems.find(
        {
          collectionId: collection.id,
          userId: userIds,
        },
        { orderBy: ['createdAt'] },
      )

      return items.sort((a, b) => ascending(a.data?.sequence, b.data?.sequence))
    },
    { many: true },
    (userId, rows) => rows.filter((row) => row.userId === userId),
  ),
})
