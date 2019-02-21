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
const { graphql: collections } = require('@orbiting/backend-modules-collections')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-collections/loaders')
}

const { accessScheduler, graphql: access } = require('@orbiting/backend-modules-access')
const { previewScheduler, preview: previewLib } = require('@orbiting/backend-modules-preview')
const membershipScheduler = require('./modules/crowdfundings/lib/scheduler')

const mail = require('./modules/crowdfundings/lib/Mail')
const cluster = require('cluster')

const {
  LOCAL_ASSETS_SERVER,
  MAIL_EXPRESS_RENDER,
  SEARCH_PG_LISTENER,
  NODE_ENV,
  ACCESS_SCHEDULER,
  PREVIEW_SCHEDULER,
  MEMBERSHIP_SCHEDULER
} = process.env

const DEV = NODE_ENV && NODE_ENV !== 'production'

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
        voting,
        collections
      ]
    )
  )

  // middlewares
  const middlewares = [
    require('./modules/crowdfundings/express/paymentWebhooks'),
    require('./express/gsheets')
  ]

  if (MAIL_EXPRESS_RENDER) {
    middlewares.push(require('@orbiting/backend-modules-mail/express/render'))
  }

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

  if (ACCESS_SCHEDULER === 'false' || (DEV && ACCESS_SCHEDULER !== 'true')) {
    console.log('ACCESS_SCHEDULER prevented scheduler from begin started',
      { ACCESS_SCHEDULER, DEV }
    )
  } else {
    await accessScheduler.init({ t, mail })
  }

  if (PREVIEW_SCHEDULER === 'false' || (DEV && PREVIEW_SCHEDULER !== 'true')) {
    console.log('PREVIEW_SCHEDULER prevented scheduler from begin started',
      { PREVIEW_SCHEDULER, DEV }
    )
  } else {
    await previewScheduler.init({ t, mail })
  }

  if (MEMBERSHIP_SCHEDULER === 'false' || (DEV && MEMBERSHIP_SCHEDULER !== 'true')) {
    console.log('MEMBERSHIP_SCHEDULER prevented scheduler from begin started',
      { MEMBERSHIP_SCHEDULER, DEV }
    )
  } else {
    await membershipScheduler.init({ t, mail })
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
