const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(
    ids => context.pgdb.public.cardGroups.find({ id: ids })
  ),
  bySlug: createDataLoader(
    slugs => context.pgdb.public.cardGroups.find({ slug: slugs }),
    null,
    (key, rows) => rows.find(row => row.slug === key)
  )
})
