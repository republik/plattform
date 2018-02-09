const { createApolloFetch } = require('apollo-fetch')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const ws = require('ws')

let cookie

module.exports = {
  createApolloFetch: (uri) => createApolloFetch({uri})
    .useAfter(({ response }, next) => {
      let setCookies
      try {
        setCookies = response.headers._headers['set-cookie']
      } catch (e) {}
      if (setCookies && setCookies.length > 0) {
        cookie = setCookies.map(c => c.split(';')[0]).join('; ')
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
          cookies: cookie || null
        },
        ...options
      },
      ws
    )
  }
}
