const PgDb = require('./lib/pgdb')
const express = require('express')
const cors = require('cors')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

const { createServer } = require('http')

process.env.PORT = process.env.PORT || 3004

const {CORS_WHITELIST_URL} = process.env

const auth = require('./src/auth')
const graphql = require('./graphql')
const githubAuth = require('./src/githubAuth')
const assets = require('./src/assets')

PgDb.connect().then((pgdb) => {
  const server = express()
  const httpServer = createServer(server)

  // Once DB is available, setup sessions and routes for authentication
  auth.configure({
    server: server,
    secret: process.env.SESSION_SECRET,
    domain: process.env.COOKIE_DOMAIN || undefined,
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

  githubAuth(server, pgdb)
  graphql(server, pgdb, httpServer)
  assets(server)

  // start the server
  httpServer.listen(process.env.PORT, () => {
    console.info('server is running on http://localhost:' + process.env.PORT)
  })
})
