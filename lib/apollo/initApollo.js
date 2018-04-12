import { ApolloClient, createNetworkInterface, IntrospectionFragmentMatcher } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import fetch from 'isomorphic-fetch'
import {API_BASE_URL, API_WS_BASE_URL} from '../settings'

let apolloClient = null

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: 'UNION',
          name: 'Embed',
          possibleTypes: [
            {
              __typename: 'YoutubeEmbed'
            },
            {
              __typename: 'VimeoEmbed'
            },
            {
              __typename: 'YoutubeEmbed'
            }
          ]
        }
      ]
    }
  }
})

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const envConfig = {
  API_BASE_URL,
  API_WS_BASE_URL
}

function create (initialState = {}, headers = {}, config = envConfig) {
  const createNetworkInterfaceWithSubscriptions = () => {
    const networkInterface = createNetworkInterface({
      uri: config.API_BASE_URL,
      opts: {
        // Additional fetch() options like `credentials` or `headers`
        credentials: 'include',
        headers: {
          cookie: headers.cookie
        }
      }
    })

    if (!process.browser) { // no websocket while ssr
      return networkInterface
    }

    const wsClient = new SubscriptionClient(`${config.API_WS_BASE_URL}`, {
      reconnect: true,
      timeout: 50000
    })
    return addGraphQLSubscriptions(
      networkInterface,
      wsClient
    )
  }

  return new ApolloClient({
    initialState,
    fragmentMatcher,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    networkInterface: createNetworkInterfaceWithSubscriptions()
  })
}

export default function initApollo (initialState, headers, config) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, headers, config)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, undefined, config)
  }

  return apolloClient
}
