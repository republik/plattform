const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(
    ids => context.pgdb.public.comments.find({ id: ids })
  ),
  byParentId: createDataLoader(
    async parentIds => {
      const or = parentIds.map(p => ({ 'parentIds @>': [ p ] }))
      return context.pgdb.public.comments.find({ or })
    },
    null,
    (key, rows) => rows.filter(row => row.parentIds.includes(key))
  )
})
