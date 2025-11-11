import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import type { IncomingHttpHeaders } from 'node:http'
import { createLink } from './apolloLink'
import deepMerge from './deepMerge'
import { isDev, isClient } from './utils'
import possibleTypes from '../generated/possibleTypes.json'

// Based on the with-apollo example inside the Next.js repository
// Source: https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

// Filter headers which get passed from the http request to the Apollo Client request
export function forwardSSRRequestHeaders(headers: IncomingHttpHeaders) {
  return {
    // For authorization
    cookie: headers.cookie,
    authorization: headers.authorization,
    // For debugging errors
    'sentry-trace': headers['sentry-trace'],
  }
}

export type ApolloClientOptions = {
  name?: string
  version?: string
  apiUrl: string
  wsUrl?: string
  headers?: { [key: string]: string } | IncomingHttpHeaders
  onResponse?: (response: Response) => void
  errorLink?: ApolloLink
}

function createApolloClient(
  options: ApolloClientOptions,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    connectToDevTools: isClient && isDev,
    ssrMode: !isClient,
    cache: new InMemoryCache({
      typePolicies: {
        queries: {
          queryType: true,
        },
        mutations: {
          mutationType: true,
        },
        AudioSource: {
          merge: true,
        },
        // Since Meta doesn't have a key-field, update cached data
        // Source: https://www.apollographql.com/docs/react/caching/cache-field-behavior/#merging-non-normalized-objects
        Meta: {
          merge: true,
        },
        User: {
          fields: {
            audioQueue: {
              merge: (existing, incoming) => {
                return incoming
              },
            },
          },
        },
        Discussion: {
          fields: {
            userPreference: {
              merge: true,
            },
          },
        },
      },
      // Generated with the script located in scripts/generatePossibleTypes.js
      possibleTypes,
    }),
    link: ApolloLink.from(
      [options.errorLink, createLink(options)].filter(Boolean),
    ),
    name: options.name,
    version: options.version,
  })
}

// Client only, initializeApollo only sets it when in browser
let apolloClient: ApolloClient<NormalizedCacheObject> = null

export type InitializeApolloFunc = (
  initialCacheObject: NormalizedCacheObject,
  options: Pick<ApolloClientOptions, 'headers' | 'onResponse'>,
) => ApolloClient<NormalizedCacheObject>

/**
 * Initialize an Apollo Client. On the client the Apollo Client is shared across
 * the whole application and on the server a new instance is generated with each execution.
 * @param initialCache preexisting Apollo Client cache that should be used
 * to hydrate the newly created Apollo Client instance.
 * @param options
 * @returns {ApolloClient<unknown>|ApolloClient<any>}
 */
export function initializeApollo(
  initialCache: NormalizedCacheObject = null,
  options: ApolloClientOptions,
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(options)

  if (initialCache) {
    const existingCache = _apolloClient.cache.extract()
    const mergedCache = deepMerge({}, initialCache, existingCache)
    _apolloClient.cache.restore(mergedCache)
  }

  // For SSG and SSR always create a new Apollo Client
  if (!isClient) return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return apolloClient
}
