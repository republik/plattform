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

      // Create compatibility wrapper for old subscriptions-transport-ws API
      return {
        request: ({ query, variables, operationName }) => ({
          subscribe: ({ next, error, complete }) => {
            const unsubscribe = client.subscribe(
              { query, variables, operationName },
              {
                next: (value) => next(value),
                error: (err) => error && error(err),
                complete: () => complete && complete(),
              },
            )
            return { unsubscribe }
          },
        }),
        onConnected: (callback) => {
          // graphql-ws doesn't have a direct equivalent, but we can use a promise
          // The connection happens on first subscribe, so we'll call it immediately
          setTimeout(callback, 100)
        },
        close: () => {
          client.dispose()
        },
      }
    },
  }
}
