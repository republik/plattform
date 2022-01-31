const { merge } = require('apollo-modules-node')

const {
  server: Server,
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')
const {
  NotifyListener: SearchNotifyListener,
} = require('@orbiting/backend-modules-search')
const { t } = require('@orbiting/backend-modules-translate')
const SlackGreeter = require('@orbiting/backend-modules-slack/lib/SlackGreeter')
const { graphql: documents } = require('@orbiting/backend-modules-documents')
const {
  graphql: redirections,
} = require('@orbiting/backend-modules-redirections')
const { graphql: search } = require('@orbiting/backend-modules-search')
const {
  graphql: notifications,
} = require('@orbiting/backend-modules-push-notifications')
const { graphql: voting } = require('@orbiting/backend-modules-voting')
const {
  graphql: discussions,
} = require('@orbiting/backend-modules-discussions')
const {
  graphql: collections,
} = require('@orbiting/backend-modules-collections')
const {
  graphql: subscriptions,
} = require('@orbiting/backend-modules-subscriptions')
const { graphql: cards } = require('@orbiting/backend-modules-cards')
const { graphql: embeds } = require('@orbiting/backend-modules-embeds')
const { graphql: gsheets } = require('@orbiting/backend-modules-gsheets')
const { graphql: mailbox } = require('@orbiting/backend-modules-mailbox')
const { graphql: offer } = require('@orbiting/backend-modules-offer')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-voting/loaders'),
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-collections/loaders'),
  ...require('@orbiting/backend-modules-subscriptions/loaders'),
  ...require('@orbiting/backend-modules-cards/loaders'),
  ...require('@orbiting/backend-modules-embeds/loaders'),
  ...require('@orbiting/backend-modules-republik-crowdfundings/loaders'),
  ...require('@orbiting/backend-modules-republik/loaders'),
  ...require('@orbiting/backend-modules-publikator/loaders'),
}

const {
  AccessScheduler,
  graphql: access,
} = require('@orbiting/backend-modules-access')
const PublicationScheduler = require('@orbiting/backend-modules-publikator/lib/PublicationScheduler')
const MembershipScheduler = require('@orbiting/backend-modules-republik-crowdfundings/lib/scheduler')
const DatabroomScheduler = require('@orbiting/backend-modules-databroom/lib/scheduler')

const mail = require('@orbiting/backend-modules-republik-crowdfundings/lib/Mail')

const {
  LOCAL_ASSETS_SERVER,
  MAIL_EXPRESS_RENDER,
  MAIL_EXPRESS_MAILCHIMP,
  SEARCH_PG_LISTENER,
  NODE_ENV,
  ACCESS_SCHEDULER,
  MEMBERSHIP_SCHEDULER,
  PUBLICATION_SCHEDULER,
  DATABROOM_SCHEDULER,
  SERVER = 'graphql',
  DYNO,
} = process.env

const DEV = NODE_ENV ? NODE_ENV !== 'production' : true

// only used by tests, needs to run server and schedulers
const start = async () => {
  const server = await run()
  const _runOnce = await runOnce()

  const close = async () => {
    await server.close()
    await _runOnce.close()
  }

  return {
    ...server,
    close,
  }
}

const run = async (workerId, config) => {
  const { graphql: republik } = require('@orbiting/backend-modules-republik')
  const {
    graphql: republikCrowdfundings,
  } = require('@orbiting/backend-modules-republik-crowdfundings')
  const {
    graphql: publikator,
  } = require('@orbiting/backend-modules-publikator')

  const graphqlSchema = merge(republik, [
    republikCrowdfundings,
    publikator,
    documents,
    search,
    redirections,
    discussions,
    notifications,
    access,
    voting,
    collections,
    subscriptions,
    cards,
    embeds,
    gsheets,
    mailbox,
    offer,
  ])

  // middlewares
  const middlewares = [
    require('@orbiting/backend-modules-republik-crowdfundings/express/paymentWebhooks'),
    require('@orbiting/backend-modules-gsheets/express/gsheets'),
    require('@orbiting/backend-modules-mail/express/mandrill'),
    require('@orbiting/backend-modules-publikator/express/uncommittedChanges'),
    require('@orbiting/backend-modules-invoices/express'),
  ]

  if (MAIL_EXPRESS_RENDER) {
    middlewares.push(require('@orbiting/backend-modules-mail/express/render'))
  }

  if (MAIL_EXPRESS_MAILCHIMP) {
    middlewares.push(
      require('@orbiting/backend-modules-mail/express/mailchimp'),
    )
  }

  if (LOCAL_ASSETS_SERVER) {
    const { express } = require('@orbiting/backend-modules-assets')
    for (const key of Object.keys(express)) {
      middlewares.push(express[key])
    }
  }

  // signin hooks
  const signInHooks = [
    ({ userId, pgdb }) => mail.sendPledgeConfirmations({ userId, pgdb, t }),
  ]

  const applicationName = [
    'backends',
    SERVER,
    DYNO,
    'worker',
    workerId && `workerId:${workerId}`,
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
      loaders,
    }
    Object.keys(loaderBuilders).forEach((key) => {
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
    config,
  )

  const close = () => {
    return server.close().then(() => ConnectionContext.close(connectionContext))
  }

  process.once('SIGTERM', close)

  return {
    ...server,
    close,
  }
}

const runOnce = async () => {
  const applicationName = ['backends', SERVER, DYNO, 'master']
    .filter(Boolean)
    .join(' ')

  const createGraphQLContext = async () => {
    const loaders = {}
    const context = {
      ...(await ConnectionContext.create(applicationName)),
      t,
      mail,
      loaders,
    }
    Object.keys(loaderBuilders).forEach((key) => {
      loaders[key] = loaderBuilders[key](context)
    })
    return context
  }

  const context = await createGraphQLContext()

  const slackGreeter = await SlackGreeter.start()

  let searchNotifyListener
  if (SEARCH_PG_LISTENER && SEARCH_PG_LISTENER !== 'false') {
    searchNotifyListener = await SearchNotifyListener.start(context)
  }

  let accessScheduler
  if (ACCESS_SCHEDULER === 'false' || (DEV && ACCESS_SCHEDULER !== 'true')) {
    console.log('ACCESS_SCHEDULER prevented scheduler from being started', {
      ACCESS_SCHEDULER,
      DEV,
    })
  } else {
    accessScheduler = await AccessScheduler.init(context)
  }

  let membershipScheduler
  if (
    MEMBERSHIP_SCHEDULER === 'false' ||
    (DEV && MEMBERSHIP_SCHEDULER !== 'true')
  ) {
    console.log('MEMBERSHIP_SCHEDULER prevented scheduler from being started', {
      MEMBERSHIP_SCHEDULER,
      DEV,
    })
  } else {
    membershipScheduler = await MembershipScheduler.init(context)
  }

  let publicationScheduler
  if (
    PUBLICATION_SCHEDULER === 'false' ||
    (DEV && PUBLICATION_SCHEDULER !== 'true')
  ) {
    console.log(
      'PUBLICATION_SCHEDULER prevented scheduler from being started',
      { PUBLICATION_SCHEDULER, DEV },
    )
  } else {
    publicationScheduler = await PublicationScheduler.init(context).catch(
      (error) => {
        console.log(error)
        throw new Error(error)
      },
    )
  }

  let databroomScheduler
  if (
    DATABROOM_SCHEDULER === 'false' ||
    (DEV && DATABROOM_SCHEDULER !== 'true')
  ) {
    console.log(
      'DATABROOM_SCHEDULER prevented scheduler from being started',
      { DATABROOM_SCHEDULER, DEV },
    )
  } else {
    databroomScheduler = await DatabroomScheduler.init(context).catch(
      (error) => {
        console.log(error)
        throw new Error(error)
      },
    )
  }

  const close = async () => {
    await Promise.all(
      [
        slackGreeter && slackGreeter.close(),
        searchNotifyListener && searchNotifyListener.close(),
        accessScheduler && accessScheduler.close(),
        membershipScheduler && membershipScheduler.close(),
        publicationScheduler && (await publicationScheduler.close()),
        databroomScheduler && databroomScheduler.close(),
      ].filter(Boolean),
    )
    await ConnectionContext.close(context)
  }

  process.once('SIGTERM', close)

  return {
    close,
  }
}

module.exports = {
  start,
  run,
  runOnce,
  loaderBuilders,
}
