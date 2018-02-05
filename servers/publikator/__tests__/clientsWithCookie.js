const { createApolloFetch } = require('apollo-fetch')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const ws = require('ws')

let cookie

module.exports = {
  createApolloFetch: (uri) => createApolloFetch({uri})
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

  createSubscriptionClient: (uri, options) => {
    return new SubscriptionClient(uri,
      {
        connectionParams: {
          cookies: cookie
            ? cookie
            : null
        },
        ...options
      },
      ws
    )
  }
}
