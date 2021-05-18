const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const checkEnv = require('check-env')
const compression = require('compression')
const timeout = require('connect-timeout')
const helmet = require('helmet')
const sleep = require('await-sleep')

const graphql = require('./express/graphql')
const graphiql = require('./express/graphiql')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

checkEnv(['DATABASE_URL', 'SESSION_SECRET'])

const {
  PORT,
  HOST = '::',
  CORS_ALLOWLIST_URL,
  SESSION_SECRET,
  COOKIE_DOMAIN,
  COOKIE_NAME,
  IGNORE_SSL_HOSTNAME,
  RES_KEEPALIVE_INTERVALS_SECS,
  RES_KEEPALIVE_MAX_SECS,
  REQ_DELAY_MS,
  REQ_TIMEOUT,
} = process.env

// middlewares
const {
  express: { auth: Auth },
} = require('@orbiting/backend-modules-auth')
const requestLog = require('./express/requestLog')
const keepalive = require('./express/keepalive')

// init httpServer and express and start listening
const start = async (
  graphqlSchema,
  middlewares,
  t,
  connectionContext,
  createGraphqlContext = (identity) => identity,
  workerId,
) => {
  const { pgdb, redis } = connectionContext

  const server = express()
  const httpServer = createServer(server)

  server.use(
    helmet({
      hsts: {
        maxAge: 60 * 60 * 24 * 365, // 1 year to get preload approval
        preload: true,
        includeSubDomains: true,
      },
      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  )

  // prod only
  if (!DEV) {
    // enable compression
    server.use(compression())
    // trust first proxy
    server.enable('trust proxy')
    // redirect to https
    server.use((req, res, next) => {
      if (
        !req.secure &&
        (!IGNORE_SSL_HOSTNAME || req.hostname !== IGNORE_SSL_HOSTNAME)
      ) {
        res.redirect(`https://${req.hostname}${req.url}`)
      } else {
        next()
      }
    })
  }

  // artifical delay requests
  if (DEV && REQ_DELAY_MS) {
    server.all('*', async (req, res, next) => {
      await sleep(REQ_DELAY_MS)
      next()
    })
  }

  // add req._log()
  server.use(requestLog)

  if (RES_KEEPALIVE_INTERVALS_SECS) {
    const intervalsSecs = JSON.parse(RES_KEEPALIVE_INTERVALS_SECS || [25])
    server.use(keepalive(intervalsSecs, RES_KEEPALIVE_MAX_SECS))
  }

  // monitor timeouts
  if (REQ_TIMEOUT) {
    server.use(timeout(REQ_TIMEOUT, { respond: false }), (req, res, next) => {
      req.on('timeout', () => {
        console.log('request timedout:', req._log())
      })
      next()
    })
  }

  if (CORS_ALLOWLIST_URL) {
    const corsOptions = {
      origin: CORS_ALLOWLIST_URL.split(','),
      credentials: true,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
    server.use('*', cors(corsOptions))
  }

  // Once DB is available, setup sessions and routes for authentication
  const auth = Auth.configure({
    server,
    secret: SESSION_SECRET,
    domain: COOKIE_DOMAIN || undefined,
    cookieName: COOKIE_NAME,
    dev: DEV,
    pgdb,
  })

  graphql(server, httpServer, pgdb, graphqlSchema, createGraphqlContext)

  graphiql(server)

  for (const middleware of middlewares) {
    await middleware(server, pgdb, t, redis, createGraphqlContext())
  }

  let closed = false
  const close = async () => {
    if (closed) {
      console.log('server already closed')
      return
    }

    closed = true

    httpServer.close()
    auth.close()
  }

  const result = {
    close,
    createGraphqlContext,
  }

  return new Promise((resolve) => {
    const callback = () => {
      if (workerId) {
        console.info(
          `server (${workerId}) is running on http://${HOST}:${PORT}`,
        )
      } else {
        console.info(`server is running on http://${HOST}:${PORT}`)
      }
      resolve(result)
    }

    httpServer.listen(PORT, HOST, callback)
  })
}

module.exports = {
  start,
}
