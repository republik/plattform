const { createApolloFetch } = require('apollo-fetch')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const ws = require('ws')

module.exports = port => {
  const GRAPHQL_URI = `http://localhost:${port}/graphql`
  const GRAPHQL_WS_URI = `ws://localhost:${port}/graphql`
  let cookie
  return {
    createApolloFetch: () => createApolloFetch({ uri: GRAPHQL_URI })
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

    createSubscriptionClient: (options) => {
      return new SubscriptionClient(GRAPHQL_WS_URI,
        {
          connectionParams: {
            cookies: cookie || null
          },
          ...options
        },
        ws
      )
    }
  }
}
