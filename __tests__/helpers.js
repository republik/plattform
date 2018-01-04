require('../lib/env')
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

module.exports = {
  apolloFetch: createLocalApolloFetch(),
  connectIfNeeded,
  pgDatabase,
  disconnect
}
