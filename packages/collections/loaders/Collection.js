const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byKeyObj: createDataLoader(keyObjs =>
    context.pgdb.public.collections.find({
      or: keyObjs.map(keyObj => ({
        and: keyObj
      }))
    })
  )
})
