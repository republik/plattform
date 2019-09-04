const { server: Server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const { t } = require('@orbiting/backend-modules-translate')

const { graphql: documents } = require('@orbiting/backend-modules-documents')
const { graphql: search } = require('@orbiting/backend-modules-search')
const { graphql: auth } = require('@orbiting/backend-modules-auth')
const { graphql: discussions } = require('@orbiting/backend-modules-discussions')

const loaderBuilders = {
  ...require('@orbiting/backend-modules-discussions/loaders'),
  ...require('@orbiting/backend-modules-documents/loaders'),
  ...require('@orbiting/backend-modules-auth/loaders')
}

const PublicationScheduler = require('./lib/PublicationScheduler')

const uncommittedChangesMiddleware = require('./express/uncommittedChanges')
const cluster = require('cluster')

const {
  LOCAL_ASSETS_SERVER,
  NODE_ENV,
  PUBLICATION_SCHEDULER
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
      auth,
      discussions
    ]
  )

  const createGraphQLContext = (defaultContext) => {
    const loaders = {}
    const context = {
      ...defaultContext,
      t,
      loaders
    }
    Object.keys(loaderBuilders).forEach(key => {
      loaders[key] = loaderBuilders[key](context)
    })
    return context
  }

  const middlewares = [
    uncommittedChangesMiddleware
  ]

  if (LOCAL_ASSETS_SERVER) {
    const { express } = require('@orbiting/backend-modules-assets')
    for (let key of Object.keys(express)) {
      middlewares.push(express[key])
    }
  }

  const server = await Server.start(
    graphqlSchema,
    middlewares,
    t,
    createGraphQLContext,
    workerId,
    config
  )

  const close = () => {
    return server.close()
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

  let publicationScheduler
  if (PUBLICATION_SCHEDULER === 'false' || (DEV && PUBLICATION_SCHEDULER !== 'true')) {
    console.log('PUBLICATION_SCHEDULER prevented scheduler from begin started',
      { PUBLICATION_SCHEDULER, DEV }
    )
  } else {
    publicationScheduler = await PublicationScheduler.init()
      .catch(error => {
        console.log(error)
        throw new Error(error)
      })
  }

  const close = async () => {
    publicationScheduler && await publicationScheduler.close()
  }

  process.once('SIGTERM', close)

  return {
    close
  }
}

module.exports = {
  start,
  run,
  runOnce
}
