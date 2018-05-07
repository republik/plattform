const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: auth } = require('@orbiting/backend-modules-auth')

const uncommittedChangesMiddleware = require('./express/uncommittedChanges')
const cluster = require('cluster')

const {
  LOCAL_ASSETS_SERVER
} = process.env

const start = async () => {
  const httpServer = await run()
  await runOnce({ clusterMode: false })
  return httpServer
}

// in cluster mode, this runs after runOnce otherwise before
const run = (workerId) => {
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
    createGraphQLContext,
    workerId
  )
}

// in cluster mode, this runs before run otherwise after
const runOnce = (...args) => {
  if (cluster.isWorker) {
    throw new Error('runOnce must only be called on cluster.isMaster')
  }
  server.runOnce(...args)
  const scheduler = require('./lib/publicationScheduler')
  scheduler.init()
    .catch(error => {
      console.log(error)
      return error
    })
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
