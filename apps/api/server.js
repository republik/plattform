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
const { graphql: embeds } = require('@orbiting/backend-modules-embeds')
const { graphql: mailbox } = require('@orbiting/backend-modules-mailbox')
const {
  graphql: callToActions,
} = require('@orbiting/backend-modules-call-to-actions')
const {
  graphql: referralCampaigns,
} = require('@orbiting/backend-modules-referral-campaigns')
const {
  graphql: authors,
} = require('@orbiting/backend-modules-authors')
const {
  graphql: nextReads,
  ReadingPositionRefreshWorker,
  NextReadsFeedRefreshWorker,
} = require('@orbiting/backend-modules-next-reads')

const {
  graphql: paymentsGraphql,
  express: paymentsWebhook,
  StripeWebhookWorker,
  StripeCustomerCreateWorker,
  SyncAddressDataWorker,
  ConfirmSetupTransactionalWorker,
  ConfirmCancelTransactionalWorker,
  ConfirmRevokeCancellationTransactionalWorker,
  NoticeEndedTransactionalWorker,
  NoticePaymentFailedTransactionalWorker,
  SyncMailchimpSetupWorker,
  SyncMailchimpUpdateWorker,
  SyncMailchimpEndedWorker,
  ConfirmGiftSubscriptionTransactionalWorker,
  ConfirmGiftAppliedTransactionalWorker,
  setupPaymentUserEventHooks,
} = require('@orbiting/backend-modules-payments')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-voting/loaders'),
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders'),
  ...require('@orbiting/backend-modules-collections/loaders'),
  ...require('@orbiting/backend-modules-subscriptions/loaders'),
  ...require('@orbiting/backend-modules-embeds/loaders'),
  ...require('@orbiting/backend-modules-republik-crowdfundings/loaders'),
  ...require('@orbiting/backend-modules-republik/loaders'),
  ...require('@orbiting/backend-modules-publikator/loaders'),
  ...require('@orbiting/backend-modules-payments').loaders,
}

const {
  AccessScheduler,
  graphql: access,
} = require('@orbiting/backend-modules-access')
const PublicationScheduler = require('@orbiting/backend-modules-publikator/lib/PublicationScheduler')
const MembershipScheduler = require('@orbiting/backend-modules-republik-crowdfundings/lib/scheduler')
const DatabroomScheduler = require('@orbiting/backend-modules-databroom/lib/scheduler')
const MailchimpScheduler = require('@orbiting/backend-modules-mailchimp')
const MailScheduler = require('@orbiting/backend-modules-mail/lib/scheduler')

const mail = require('@orbiting/backend-modules-republik-crowdfundings/lib/Mail')

const { Queue, GlobalQueue } = require('@orbiting/backend-modules-job-queue')
const { CockpitWorker } = require('./workers/cockpit')

function setupQueue(context, monitorQueueState = undefined) {
  const queue = Queue.createInstance(GlobalQueue, {
    context,
    connectionString: process.env.DATABASE_URL,
    monitorStateIntervalSeconds: monitorQueueState,
  })

  queue.registerWorkers([
    StripeWebhookWorker,
    StripeCustomerCreateWorker,
    SyncAddressDataWorker,
    ConfirmSetupTransactionalWorker,
    ConfirmCancelTransactionalWorker,
    ConfirmRevokeCancellationTransactionalWorker,
    ConfirmGiftSubscriptionTransactionalWorker,
    ConfirmGiftAppliedTransactionalWorker,
    NoticeEndedTransactionalWorker,
    NoticePaymentFailedTransactionalWorker,
    SyncMailchimpSetupWorker,
    SyncMailchimpUpdateWorker,
    SyncMailchimpEndedWorker,
    CockpitWorker,
    ReadingPositionRefreshWorker,
    NextReadsFeedRefreshWorker,
  ])

  return queue
}

const {
  MAIL_EXPRESS_RENDER,
  MAIL_EXPRESS_MAILCHIMP,
  SEARCH_PG_LISTENER,
  NODE_ENV,
  ACCESS_SCHEDULER,
  MEMBERSHIP_SCHEDULER,
  PUBLICATION_SCHEDULER,
  DATABROOM_SCHEDULER,
  MAIL_SCHEDULER,
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
    embeds,
    mailbox,
    callToActions,
    referralCampaigns,
    paymentsGraphql,
    authors,
    nextReads,
  ])

  // middlewares
  const middlewares = [
    paymentsWebhook,
    require('@orbiting/backend-modules-republik-crowdfundings/express/paymentWebhooks'),
    require('@orbiting/backend-modules-mail/express/mandrill'),
    require('@orbiting/backend-modules-publikator/express/uncommittedChanges'),
    require('@orbiting/backend-modules-publikator/express/webhook'),
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

  const queue = setupQueue(connectionContext)
  await queue.start()
  setupPaymentUserEventHooks(connectionContext)

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
  const applicationName = ['backends', SERVER, DYNO, 'scheduler']
    .filter(Boolean)
    .join(' ')

  const connectionContext = await ConnectionContext.create(applicationName)

  const createGraphQLContext = async (defaultContext) => {
    const loaders = {}
    const context = {
      ...defaultContext,
      ...connectionContext,
      t,
      mail,
      loaders,
    }
    Object.keys(loaderBuilders).forEach((key) => {
      loaders[key] = loaderBuilders[key](context)
    })
    return context
  }

  const context = await createGraphQLContext({ scope: 'scheduler' })

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
    console.log('DATABROOM_SCHEDULER prevented scheduler from being started', {
      DATABROOM_SCHEDULER,
      DEV,
    })
  } else {
    databroomScheduler = await DatabroomScheduler.init(context).catch(
      (error) => {
        console.log(error)
        throw new Error(error)
      },
    )
  }

  let mailScheduler
  let mailchimpScheduler
  if (MAIL_SCHEDULER === 'false' || (DEV && MAIL_SCHEDULER !== 'true')) {
    console.log('MAIL_SCHEDULER prevented scheduler from being started', {
      MAIL_SCHEDULER,
      DEV,
    })
  } else {
    mailScheduler = await MailScheduler.init(context).catch((error) => {
      console.log(error)
      throw new Error(error)
    })
    mailchimpScheduler = await MailchimpScheduler.init(context).catch(
      (error) => {
        console.log(error)
        throw new Error(error)
      },
    )
  }

  const queue = setupQueue(connectionContext, 120)
  await queue.start()
  await queue.startWorkers()
  await queue.schedule(
    'cockpit:refresh',
    '*/30 * * * *', // cron for every 30 minutes
  )
  await queue.schedule(
    'next_reads:reading_position',
    '15,45 * * * *', // At minute the 15th and 45th minute
  )
  await queue.schedule(
    'next_reads:feed:refresh',
    '*/30 * * * *', // every 30 minutes
  )

  const close = async () => {
    await Promise.all(
      [
        slackGreeter && slackGreeter.close(),
        searchNotifyListener && searchNotifyListener.close(),
        accessScheduler && accessScheduler.close(),
        membershipScheduler && membershipScheduler.close(),
        publicationScheduler && (await publicationScheduler.close()),
        databroomScheduler && databroomScheduler.close(),
        mailScheduler && mailScheduler.close(),
        mailchimpScheduler && mailchimpScheduler.close(),
        queue && queue.stop(),
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
