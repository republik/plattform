const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: auth } = require('@orbiting/backend-modules-auth')

const uncommittedChangesMiddleware = require('./express/uncommittedChanges')

const {
  LOCAL_ASSETS_SERVER
} = process.env

const run = () => {
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents, auth]))

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

  return server.start(
    executableSchema,
    middlewares,
    t,
    createGraphQLContext
  )
}

const runOnce = () => {
  const scheduler = require('./lib/publicationScheduler')
  scheduler.init()
    .catch(error => {
      console.log(error)
      return error
    })
}

const start = async () => {
  const httpServer = await run()
  runOnce()
  return httpServer
}

const close = () => {
  server.close()
  require('./lib/publicationScheduler').quit()
}

module.exports = {
  start,
  run,
  runOnce,
  close
}

process.on('SIGTERM', () => {
  close()
})
