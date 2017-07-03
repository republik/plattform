import { ApolloClient, createNetworkInterface } from 'react-apollo'
import * as fetch from 'isomorphic-fetch'

let apolloClient: ApolloClient

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const create = (initialState?: any): ApolloClient =>
  new ApolloClient({
    initialState,
    ssrMode: !process.browser,
    networkInterface: createNetworkInterface({
      uri: 'https://api.graph.cool/simple/v1/cixmkt2ul01q00122mksg82pn',
      opts: {
        credentials: 'same-origin'
      }
    })
  })

const initApollo = (initialState?: any): ApolloClient => {
  if (!process.browser) {
    return create(initialState)
  }

  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}

export default initApollo
