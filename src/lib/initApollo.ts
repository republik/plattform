import {
  ApolloClient,
  createNetworkInterface
} from 'react-apollo'
import * as fetch from 'isomorphic-fetch'
import {
  API_BASE_URL,
  API_AUTHORIZATION_HEADER
} from '../constants'

let apolloClient: ApolloClient

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const create = (
  initialState?: any,
  headers: any = {}
): ApolloClient =>
  new ApolloClient({
    initialState,
    ssrMode: !process.browser,
    networkInterface: createNetworkInterface({
      uri: `${API_BASE_URL}/graphql`,
      opts: {
        credentials: 'include',
        headers: {
          Authorization: API_AUTHORIZATION_HEADER,
          cookie: headers.cookie
        }
      }
    })
  })

const initApollo = (
  initialState?: any,
  headers: any = {}
): ApolloClient => {
  if (!process.browser) {
    return create(initialState, headers)
  }

  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}

export default initApollo
