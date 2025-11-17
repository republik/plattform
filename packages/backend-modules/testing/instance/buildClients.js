const { createApolloFetch } = require('apollo-fetch')
const { createClient } = require('graphql-ws')
const ws = require('ws')

module.exports = (port) => {
  const GRAPHQL_URI = `http://localhost:${port}/graphql`
  const GRAPHQL_WS_URI = `ws://localhost:${port}/graphql`
  let cookie
  return {
    createApolloFetch: () =>
      createApolloFetch({ uri: GRAPHQL_URI })
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
        }),

    createSubscriptionClient: (options = {}) => {
      const client = createClient({
        url: GRAPHQL_WS_URI,
        connectionParams: () => ({
          cookies: cookie || null,
        }),
        webSocketImpl: ws,
        retryAttempts: 0,
        on: {
          connected: options.connectionCallback
            ? () => options.connectionCallback(null)
            : undefined,
          error: options.connectionCallback || undefined,
        },
      })

      return client
    },
  }
}
