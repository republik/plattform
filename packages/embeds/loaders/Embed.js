const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byUrl: createDataLoader(
    urls => context.pgdb.public.embeds.find({ url: urls }),
    null,
    (key, rows) => rows.find(row => row.url.toLowerCase() === key.toLowerCase())
  )
})
