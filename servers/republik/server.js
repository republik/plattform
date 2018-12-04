const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')
const { graphql: search } = require('@orbiting/backend-modules-search')
const { graphql: notifications } = require('@orbiting/backend-modules-notifications')
const { graphql: voting } = require('@orbiting/backend-modules-voting')
const { graphql: discussions } = require('@orbiting/backend-modules-discussions')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders')
}

const { accessScheduler, graphql: access } = require('@orbiting/backend-modules-access')
const { previewScheduler, preview: previewLib } = require('@orbiting/backend-modules-preview')

const mail = require('./modules/crowdfundings/lib/Mail')
const cluster = require('cluster')

const {
  LOCAL_ASSETS_SERVER,
  SEARCH_PG_LISTENER,
  ACCESS_SCHEDULER_OFF,
  PREVIEW_SCHEDULER_OFF
} = process.env

const start = async () => {
  const httpServer = await run()
  await runOnce({ clusterMode: false })
  return httpServer
}

// in cluster mode, this runs after runOnce otherwise before
const run = async (workerId) => {
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(
    merge(
      localModule,
      [
        documents,
        search,
        redirections,
        discussions,
        notifications,
        access,
        voting
      ]
    )
  )

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
    ({ userId, pgdb }) =>
      mail.sendPledgeConfirmations({ userId, pgdb, t }),
    ({ userId, isNew, pgdb }) =>
      accessScheduler.signInHook(userId, isNew, pgdb, mail),
    ({ userId, isNew, contexts, pgdb }) =>
      previewLib.begin({ userId, contexts, pgdb, t })
  ]

  const createGraphQLContext = (defaultContext) => {
    const loaders = {}
    const context = {
      ...defaultContext,
      t,
      signInHooks,
      mail,
      loaders
    }
    Object.keys(loaderBuilders).forEach(key => {
      loaders[key] = loaderBuilders[key](context)
    })
    return context
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
const runOnce = async (...args) => {
  if (cluster.isWorker) {
    throw new Error('runOnce must only be called on cluster.isMaster')
  }
  server.runOnce(...args)
  require('./lib/slackGreeter').connect()
  if (SEARCH_PG_LISTENER) {
    require('@orbiting/backend-modules-search').notifyListener.run()
  }

  if (ACCESS_SCHEDULER_OFF === 'true') {
    console.log('ACCESS_SCHEDULER_OFF prevented scheduler from begin started')
  } else {
    await accessScheduler.init({ t, mail })
  }

  if (PREVIEW_SCHEDULER_OFF === 'true') {
    console.log('PREVIEW_SCHEDULER_OFF prevented scheduler from begin started')
  } else {
    await previewScheduler.init({ t, mail })
  }
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
