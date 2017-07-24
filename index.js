const PgDb = require('./lib/pgdb')
const express = require('express')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

process.env.PORT = process.env.PORT || 3004

const auth = require('./src/auth')
const graphql = require('./graphql')
const githubAuth = require('./src/githubAuth')

PgDb.connect().then((pgdb) => {
  const server = express()

  // Once DB is available, setup sessions and routes for authentication
  auth.configure({
    server: server,
    secret: process.env.SESSION_SECRET,
    domain: process.env.COOKIE_DOMAIN || undefined,
    dev: DEV,
    pgdb: pgdb
  })

  githubAuth(server, pgdb)
  graphql(server, pgdb)

  // start the server
  server.listen(process.env.PORT, () => {
    console.info('server is running on http://localhost:' + process.env.PORT)
  })
})
