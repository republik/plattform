const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')

const sendPendingPledgeConfirmations = require('./modules/crowdfundings/lib/sendPendingPledgeConfirmations')
const mail = require('./modules/crowdfundings/lib/Mail')
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
const run = async (workerId) => {
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents, redirections]))

  // middlewares
  const middlewares = [
    require('./modules/crowdfundings/express/paymentWebhooks'),
    require('./express/gsheets')
  ]

  if (LOCAL_ASSETS_SERVER) {
    const { express } = require('@orbiting/backend-modules-assets')
    for (let key of Object.keys(express)) {
      middlewares.push(express[key])
    }
  }

  // signin hooks
  const signInHooks = [
    async (userId, isNew, pgdb) =>
      sendPendingPledgeConfirmations(userId, pgdb, t)
  ]

  const createGraphQLContext = (defaultContext) => ({
    ...defaultContext,
    t,
    signInHooks,
    mail
  })

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
  return require('./lib/slackGreeter').connect()
}

const close = () => {
  server.close()
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
