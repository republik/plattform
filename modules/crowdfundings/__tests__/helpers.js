const dedupe = require('dynamic-dedupe')
dedupe.activate()

const { PORT } = process.env

const Server = require('../../../server')
const sleep = require('await-sleep')
const { lib: { redis } } = require('@orbiting/backend-modules-base')

const { createApolloFetch } = require('apollo-fetch')

// shared
var server = null

const createLocalApolloFetch = () => {
  const GRAPHQL_URI = `http://localhost:${PORT}/graphql`
  return createApolloFetch({ uri: GRAPHQL_URI })
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

module.exports = {
  apolloFetch: createLocalApolloFetch(),
  connectIfNeeded,
  pgDatabase,
  disconnect
}
