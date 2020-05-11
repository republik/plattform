const { merge } = require('apollo-modules-node')
const cluster = require('cluster')

const {
  server: Server,
  lib: { ConnectionContext }
} = require('@orbiting/backend-modules-base')
const { NotifyListener: SearchNotifyListener } = require('@orbiting/backend-modules-search')
const { t } = require('@orbiting/backend-modules-translate')
const SlackGreeter = require('@orbiting/backend-modules-slack/lib/SlackGreeter')
const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: redirections } = require('@orbiting/backend-modules-redirections')
const { graphql: search } = require('@orbiting/backend-modules-search')
const { graphql: notifications } = require('@orbiting/backend-modules-push-notifications')
const { graphql: voting } = require('@orbiting/backend-modules-voting')
const { graphql: discussions } = require('@orbiting/backend-modules-discussions')
const { graphql: collections } = require('@orbiting/backend-modules-collections')
const { graphql: crowdsourcing } = require('@orbiting/backend-modules-crowdsourcing')
const { graphql: subscriptions } = require('@orbiting/backend-modules-subscriptions')
const { graphql: cards } = require('@orbiting/backend-modules-cards')
const { graphql: maillog } = require('@orbiting/backend-modules-maillog')
const { graphql: embeds } = require('@orbiting/backend-modules-embeds')
const { graphql: gsheets } = require('@orbiting/backend-modules-gsheets')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-voting/loaders'),
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-collections/loaders'),
  ...require('@orbiting/backend-modules-maillog/loaders'),
  ...require('@orbiting/backend-modules-subscriptions/loaders'),
  ...require('@orbiting/backend-modules-cards/loaders'),
  ...require('@orbiting/backend-modules-embeds/loaders'),
  ...require('./loaders')
}

const { AccessScheduler, graphql: access } = require('@orbiting/backend-modules-access')

const MembershipScheduler = require('./modules/crowdfundings/lib/scheduler')
const mail = require('./modules/crowdfundings/lib/Mail')

const {
  LOCAL_ASSETS_SERVER,
  MAIL_EXPRESS_RENDER,
  SEARCH_PG_LISTENER,
  NODE_ENV,
  ACCESS_SCHEDULER,
  MEMBERSHIP_SCHEDULER,
  SERVER = 'republik',
  DYNO
} = process.env

const DEV = NODE_ENV && NODE_ENV !== 'production'

const start = async () => {
  const server = await run()
  const _runOnce = await runOnce({ clusterMode: false })

  const close = async () => {
    await server.close()
    await _runOnce.close()
  }

  return {
    ...server,
    close
  }
}

// in cluster mode, this runs after runOnce otherwise before
const run = async (workerId, config) => {
  const localModule = require('./graphql')
  const graphqlSchema = merge(
    localModule,
    [
      documents,
      search,
      redirections,
      discussions,
      notifications,
      access,
      voting,
      collections,
      crowdsourcing,
      subscriptions,
      cards,
      maillog,
      embeds,
      gsheets
    ]
  )

  // middlewares
  const middlewares = [
    require('./modules/crowdfundings/express/paymentWebhooks'),
    require('@orbiting/backend-modules-gsheets/express/gsheets'),
    require('@orbiting/backend-modules-maillog/express/Mandrill/webhook')
  ]

  if (MAIL_EXPRESS_RENDER) {
    middlewares.push(require('@orbiting/backend-modules-mail/express/render'))
  }

  if (LOCAL_ASSETS_SERVER) {
    const { express } = require('@orbiting/backend-modules-assets')
    for (const key of Object.keys(express)) {
      middlewares.push(express[key])
    }
  }

  // signin hooks
  const signInHooks = [
    ({ userId, pgdb }) =>
      mail.sendPledgeConfirmations({ userId, pgdb, t })
  ]

  const applicationName = [
    'backends',
    SERVER,
    DYNO,
    'worker',
    workerId && `workerId:${workerId}`
  ]
    .filter(Boolean)
    .join(' ')

  const connectionContext = await ConnectionContext.create(applicationName)

  const createGraphQLContext = (defaultContext) => {
    const loaders = {}
    const context = {
      ...defaultContext,
      ...connectionContext,
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

  const server = await Server.start(
    graphqlSchema,
    middlewares,
    t,
    connectionContext,
    createGraphQLContext,
    workerId,
    config
  )

  const close = () => {
    return server.close()
      .then(() => ConnectionContext.close(connectionContext))
  }

  process.once('SIGTERM', close)

  return {
    ...server,
    close
  }
}

// in cluster mode, this runs before run otherwise after
const runOnce = async (...args) => {
  if (cluster.isWorker) {
    throw new Error('runOnce must only be called on cluster.isMaster')
  }

  const applicationName = [
    'backends',
    SERVER,
    DYNO,
    'master'
  ]
    .filter(Boolean)
    .join(' ')

  const context = {
    ...await ConnectionContext.create(applicationName),
    t,
    mail
  }

  const slackGreeter = await SlackGreeter.start()

  let searchNotifyListener
  if (SEARCH_PG_LISTENER && SEARCH_PG_LISTENER !== 'false') {
    searchNotifyListener = await SearchNotifyListener.start(context)
  }

  let accessScheduler
  if (ACCESS_SCHEDULER === 'false' || (DEV && ACCESS_SCHEDULER !== 'true')) {
    console.log('ACCESS_SCHEDULER prevented scheduler from begin started',
      { ACCESS_SCHEDULER, DEV }
    )
  } else {
    accessScheduler = await AccessScheduler.init(context)
  }

  let membershipScheduler
  if (MEMBERSHIP_SCHEDULER === 'false' || (DEV && MEMBERSHIP_SCHEDULER !== 'true')) {
    console.log('MEMBERSHIP_SCHEDULER prevented scheduler from begin started',
      { MEMBERSHIP_SCHEDULER, DEV }
    )
  } else {
    membershipScheduler = await MembershipScheduler.init(context)
  }

  const close = async () => {
    await Promise.all([
      slackGreeter && slackGreeter.close(),
      searchNotifyListener && searchNotifyListener.close(),
      accessScheduler && accessScheduler.close(),
      membershipScheduler && membershipScheduler.close()
    ].filter(Boolean))
    await ConnectionContext.close(context)
  }

  process.once('SIGTERM', close)

  return {
    close
  }
}

module.exports = {
  start,
  run,
  runOnce,
  loaderBuilders
}
