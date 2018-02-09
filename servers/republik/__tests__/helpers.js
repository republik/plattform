require('@orbiting/backend-modules-env').config()
const Server = require('../server')
const sleep = require('await-sleep')
const { lib: { redis } } = require('@orbiting/backend-modules-base')

const { createApolloFetch } = require('apollo-fetch')

// shared
var server = null
var cookie = null

const createLocalApolloFetch = () => {
  const GRAPHQL_URI = `http://localhost:${process.env.PORT}/graphql`
  return createApolloFetch({ uri: GRAPHQL_URI })
    .useAfter(({ response }, next) => {
      let setCookie
      try {
        setCookie = response.headers._headers['set-cookie'][0]
      } catch (e) {}
      if (setCookie) {
        cookie = setCookie.split(';')[0]
      }
      next()
    })
    .use(({ options }, next) => {
      if (cookie) {
        if (!options.headers) {
          options.headers = {}
        }
        options.headers['Cookie'] = cookie
      }
      next()
    })
}

const connectIfNeeded = async function () {
  if (server) return server
  await redis.flushdbAsync()
  await sleep(1000)
  server = await Server.run()
  return server
}

const pgDatabase = () => server.pgdb

const disconnect = async () => {
  await Server.close()
}

const throwOnOpenTransaction = async () => {
  const locksEnd = await server.pgdb.query('SELECT count(*) FROM pg_stat_activity WHERE state = :state', {
    'state': 'idle in transaction'
  })
  if (locksEnd && locksEnd[0] && locksEnd[0].count > 0) {
    const locks = await server.pgdb.query('SELECT * FROM pg_stat_activity WHERE state = :state', {
      'state': 'idle in transaction'
    })
    console.warn(JSON.stringify(locks))
    throw new Error('AT LEAST ONE OPEN TRANSACTION')
  }
  return true
}

module.exports = {
  apolloFetch: createLocalApolloFetch(),
  throwOnOpenTransaction,
  connectIfNeeded,
  pgDatabase,
  disconnect
}
