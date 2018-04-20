const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: auth } = require('@orbiting/backend-modules-auth')
const { graphql: search } = require('@orbiting/backend-modules-search')

const uncommittedChangesMiddleware = require('./express/uncommittedChanges')

const {
  LOCAL_ASSETS_SERVER
} = process.env

module.exports.run = () => {
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents, search, auth]))

  const createGraphQLContext = (defaultContext) => ({
    ...defaultContext,
    t
  })

  const middlewares = [
    uncommittedChangesMiddleware
  ]

  if (LOCAL_ASSETS_SERVER) {
    const { express } = require('@orbiting/backend-modules-assets')
    for (let key of Object.keys(express)) {
      middlewares.push(express[key])
    }
  }

  return server.run(executableSchema, middlewares, t, createGraphQLContext)
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
