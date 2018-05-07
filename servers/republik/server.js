const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')

const sendPendingPledgeConfirmations = require('./modules/crowdfundings/lib/sendPendingPledgeConfirmations')
const mail = require('./modules/crowdfundings/lib/Mail')

const {
  LOCAL_ASSETS_SERVER
} = process.env

const run = (workerId) => {
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
      sendPendingPledgeConfirmations(userId, pgdb, t),
    async (userId, isNew, pgdb) =>
      isNew && mail.enforceSubscriptions({ pgdb, userId, isNew })
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

const runOnce = () => {
  server.runOnce()
  return require('./lib/slackGreeter').connect()
}

const start = async () => {
  const httpServer = await run()
  runOnce()
  return httpServer
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
