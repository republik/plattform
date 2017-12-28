const PgDb = require('./lib/pgdb')
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Engine } = require('apollo-engine')
const checkEnv = require('check-env')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

checkEnv([
  'DATABASE_URL',
  'SESSION_SECRET'
])

const {
  PORT,
  CORS_WHITELIST_URL,
  SESSION_SECRET,
  COOKIE_DOMAIN,
  COOKIE_NAME,
  ENGINE_API_KEY
} = process.env

// middlewares
const { express: { auth } } = require('@orbiting/backend-modules-auth')
const requestLog = require('./express/requestLog')
const graphql = require('./express/graphql')

let pgdb
let server
let httpServer
let subscriptionServer

module.exports.run = (executableSchema, middlewares, t, signInHooks) => {
  // init apollo engine
  const engine = ENGINE_API_KEY
    ? new Engine({
      engineConfig: {
        apiKey: ENGINE_API_KEY,
        logging: {
          level: 'INFO'   // Engine Proxy logging level. DEBUG, INFO, WARN or ERROR
        }
      },
      graphqlPort: PORT
    })
    : null
  if (engine) {
    engine.start()
  }

  return PgDb.connect().then( async (_pgdb) => {
    pgdb = _pgdb
    server = express()
    httpServer = createServer(server)

    // apollo engine middleware
    if (engine) {
      server.use(engine.expressMiddleware())
    }

    server.use(requestLog)

    // Once DB is available, setup sessions and routes for authentication
    auth.configure({
      server: server,
      secret: SESSION_SECRET,
      domain: COOKIE_DOMAIN || undefined,
      cookieName: COOKIE_NAME,
      dev: DEV,
      pgdb: pgdb,
      signInHooks
    })

    if (CORS_WHITELIST_URL) {
      const corsOptions = {
        origin: CORS_WHITELIST_URL.split(','),
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      }
      server.use('*', cors(corsOptions))
    }

    subscriptionServer = graphql(server, pgdb, httpServer, executableSchema, t)

    for(let middleware of middlewares) {
      await middleware(server, pgdb, t)
    }

    // start the server
    httpServer.listen(PORT, () => {
      console.info('server is running on http://localhost:' + PORT)
    })

    return { pgdb }
  })
}

module.exports.close = () => {
  const { pubsub } = require('./lib/RedisPubSub')
  pubsub.getSubscriber().quit()
  pubsub.getPublisher().quit()
  subscriptionServer.close()
  httpServer.close()
  pgdb.close()
  require('./lib/redis').quit()
  pgdb = null
  server = null
  httpServer = null
  subscriptionServer = null
  // TODO server leaks timers, force teardown for now
  console.info('forced server shutdown in 15s max')
  setTimeout(() => {
    process.exit(0)
  }, 15000)
}
