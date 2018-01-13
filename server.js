const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')
const sendPendingPledgeConfirmations = require('./modules/crowdfundings/lib/sendPendingPledgeConfirmations')
const { updateUserOnMailchimp } = require('@orbiting/backend-modules-mail')
const { express: { assets } } = require('@orbiting/backend-modules-assets')

module.exports.run = () => {
  require('./lib/slackGreeter')
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents, redirections]))

  // middlewares
  const middlewares = [
    require('./modules/crowdfundings/express/paymentWebhooks'),
    require('./express/gsheets'),
    require('./express/pageRenderer'),
    assets
  ]

  // signin hooks
  const signInHooks = [
    async (userId, isNew, pgdb) =>
      sendPendingPledgeConfirmations(userId, pgdb, t),
    async (userId, isNew, pgdb) => {
      isNew && updateUserOnMailchimp({userId, pgdb, isNew})
    }
  ]

  return server.run(executableSchema, middlewares, t, signInHooks)
}

module.exports.close = () => {
  server.close()
}
