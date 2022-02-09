import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory'

import fetch from 'isomorphic-unfetch'

import { API_URL, API_AUTHORIZATION_HEADER } from '../server/constants'
import introspectionQueryResultData from './fragmentTypes.json'

let apolloClient = null

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
})

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

export const dataIdFromObject = (object) => {
  if (object.__typename) {
    if (object.id !== undefined) {
      return `${object.__typename}:${object.id}`
    }
    if (object._id !== undefined) {
      return `${object.__typename}:${object._id}`
    }
  }
  return null
}

function create(initialState = {}, headers = {}) {
  const http = new HttpLink({
    uri: API_URL,
    credentials: 'include',
    headers: {
      cookie: headers.cookie,
      accept: headers.accept,
      Authorization: API_AUTHORIZATION_HEADER,
    },
  })

  const link = http

  return new ApolloClient({
    connectToDevTools: process.browser,
    cache: new InMemoryCache({
      dataIdFromObject,
      fragmentMatcher,
    }).restore(initialState || {}),
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link,
  })
}

export default function initApollo(initialState, headers) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState, headers)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, headers)
  }

  return apolloClient
}
