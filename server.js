const { server } = require('@orbiting/backend-modules-base')

module.exports.run = () => {
  const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
  const t = require('./lib/t')

  // middlewares
  const assets = require('./express/assets')

  // graphql schema
  const executableSchema = mergeSchemas({
    schemas: [
      makeExecutableSchema(require('@orbiting/backend-modules-auth').graphql),
      makeExecutableSchema(require('@orbiting/backend-modules-documents').graphql),
      makeExecutableSchema(require('./graphql'))
    ]
  })

  return server.run(executableSchema, [assets], t)
    .then(async (obj) => {
      const scheduler = require('./lib/publicationScheduler')
      await scheduler.init()
        .catch(error => { console.log(error); return error })
      return obj
    })
}

module.exports.close = () => {
  server.close()
  require('./lib/publicationScheduler').quit()
}
