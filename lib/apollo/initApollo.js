import { ApolloClient, createNetworkInterface } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import fetch from 'isomorphic-fetch'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const API_BASE_URL = 'http://localhost:3004/github/graphql'
const API_WS_BASE_URL = 'ws://localhost:3004/graphql'

function create (initialState = {}, headers = {}) {
  const _createNetworkInterface = (withSubscription) => {
    const networkInterface = createNetworkInterface({
      uri: API_BASE_URL,
      opts: {
        // Additional fetch() options like `credentials` or `headers`
        credentials: 'include',
        headers
      }
    })

    if (!withSubscription) {
      return networkInterface
    }

    const wsClient = new SubscriptionClient(`${API_WS_BASE_URL}`, {
      reconnect: true
    })
    return addGraphQLSubscriptions(
      networkInterface,
      wsClient
    )
  }

  return new ApolloClient({
    initialState,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    networkInterface: _createNetworkInterface(process.browser) // no websocket while ssr
  })
}

export default function initApollo (initialState, headers) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, headers)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}
