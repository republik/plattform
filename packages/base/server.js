const PgDb = require('./lib/pgdb')
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Engine } = require('apollo-engine')
const checkEnv = require('check-env')
const compression = require('compression')
const timeout = require('connect-timeout')

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
  ENGINE_API_KEY,
  IGNORE_SSL_HOSTNAME,
  REQ_TIMEOUT
} = process.env

// middlewares
const { express: { auth } } = require('@orbiting/backend-modules-auth')
const requestLog = require('./express/requestLog')

let pgdb
let server
let httpServer
let subscriptionServer

module.exports.run = (executableSchema, middlewares, t, createGraphqlContext) => {
  // init apollo engine
  // https://github.com/apollographql/apollo-engine-js#middleware-configuration
  // https://www.apollographql.com/docs/engine/proto-doc.html
  const engine = ENGINE_API_KEY
    ? new Engine({
      engineConfig: {
        apiKey: ENGINE_API_KEY,
        logging: {
          level: 'INFO'   // Engine Proxy logging level. DEBUG, INFO, WARN or ERROR
        }
      },
      origin: {
        requestTimeout: '60m'
      },
      graphqlPort: PORT
    })
    : null
  if (engine) {
    engine.start()
  }

  return PgDb.connect().then(async (_pgdb) => {
    pgdb = _pgdb
    server = express()
    httpServer = createServer(server)

    // prod only
    if (!DEV) {
      // enable compression
      server.use(compression())
      // trust first proxy
      server.enable('trust proxy')
      // redirect to https
      server.use((req, res, next) => {
        if (!req.secure && (!IGNORE_SSL_HOSTNAME || req.hostname !== IGNORE_SSL_HOSTNAME)) {
          res.redirect(`https://${req.hostname}${req.url}`)
        }
        return next()
      })
      // clear obsolete cf cookie
      // this code was added 2018.01.19 - remove it after 2018.03.02
      server.use((req, res, next) => {
        res.clearCookie('__cfduid', { path: '/', httpOnly: true, domain: '.republik.ch' })
        next()
      })
    }

    // add req._log()
    server.use(requestLog)

    // monitor timeouts
    if (REQ_TIMEOUT) {
      server.use(
        timeout(REQ_TIMEOUT, { respond: false }),
        (req, res, next) => {
          req.on('timeout', () => {
            console.log('request timedout:', req._log())
          })
          next()
        }
      )
    }

    // apollo engine middleware
    if (engine) {
      server.use(engine.expressMiddleware())
    }

    // Once DB is available, setup sessions and routes for authentication
    auth.configure({
      server: server,
      secret: SESSION_SECRET,
      domain: COOKIE_DOMAIN || undefined,
      cookieName: COOKIE_NAME,
      dev: DEV,
      pgdb: pgdb
    })

    if (CORS_WHITELIST_URL) {
      const corsOptions = {
        origin: CORS_WHITELIST_URL.split(','),
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      }
      server.use('*', cors(corsOptions))
    }

    if (executableSchema) {
      const graphql = require('./express/graphql')
      subscriptionServer = graphql(server, pgdb, httpServer, executableSchema, createGraphqlContext)
    }

    for (let middleware of middlewares) {
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
  if (subscriptionServer) {
    subscriptionServer.close()
  }
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
