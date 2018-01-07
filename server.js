const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')
const sendPendingPledgeConfirmations = require('./modules/crowdfundings/lib/sendPendingPledgeConfirmations')

module.exports.run = () => {
  require('./lib/slackGreeter')
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents, redirections]))

  // middlewares
  const middlewares = [
    require('./modules/crowdfundings/express/paymentWebhooks'),
    require('./express/gsheets')
  ]

  // signin hooks
  const signInHooks = [
    async (userId, pgdb) =>
      sendPendingPledgeConfirmations(userId, pgdb, t)
  ]

  return server.run(executableSchema, middlewares, t, signInHooks)
}

module.exports.close = () => {
  server.close()
}
