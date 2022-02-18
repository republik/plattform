import { useMemo } from 'react'
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { createLink } from './apolloLink'
import deepMerge from '../deepMerge'
import fetch from 'isomorphic-unfetch'

const isDev = process.env.NODE_ENV && process.env.NODE_ENV === 'development'

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

// Based on the with-apollo example inside the Next.js repository
// Source: https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

type Options = {
  headers?: any
  onResponse?: any
}

function createApolloClient(
  options: Options = {},
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    connectToDevTools: process.browser && isDev,
    ssrMode: !process.browser,
    cache: new InMemoryCache({
      typePolicies: {
        // Since Meta doesn't have a key-field, update cached data
        // Source: https://www.apollographql.com/docs/react/caching/cache-field-behavior/#merging-non-normalized-objects
        Meta: {
          merge: true,
        },
        Discussion: {
          fields: {
            userPreference: {
              merge: true,
            },
          },
        },
      },
      // Generated with a script found in the apollo-client docs:
      // https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically
      possibleTypes: {
        Reward: ['Goodie', 'MembershipType'],
        RepoPhaseInterface: ['RepoPhase', 'RepoPhaseWithCount'],
        MilestoneInterface: ['Publication', 'Milestone'],
        PlayableMedia: ['AudioSource', 'YoutubeEmbed', 'VimeoEmbed'],
        SearchEntity: ['Document', 'DocumentZone', 'Comment', 'User'],
        VotingInterface: ['Voting', 'Election'],
        QuestionInterface: [
          'QuestionTypeText',
          'QuestionTypeDocument',
          'QuestionTypeRange',
          'QuestionTypeChoice',
        ],
        CollectionItemInterface: [
          'CollectionItem',
          'DocumentProgress',
          'MediaProgress',
        ],
        EventObject: ['Comment', 'Document'],
        SubscriptionObject: ['Document', 'User', 'Discussion'],
        Embed: [
          'TwitterEmbed',
          'YoutubeEmbed',
          'VimeoEmbed',
          'DocumentCloudEmbed',
        ],
        CachedEmbed: ['LinkPreview', 'TwitterEmbed'],
      },
    }),
    link: createLink(
      options.headers ?? undefined,
      options.onResponse ?? undefined,
    ),
  })
}

// Client only, initializeApollo only sets it when in browser
let apolloClient: ApolloClient<NormalizedCacheObject> = null

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
  options: Options = {},
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(options)

  if (initialCache) {
    const existingCache = _apolloClient.cache.extract()
    const mergedCache = deepMerge({}, initialCache, existingCache)
    _apolloClient.cache.restore(mergedCache)
  }

  // For SSG and SSR always create a new Apollo Client
  if (!process.browser) return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return apolloClient
}

/**
 * Hook to retrieve an Apollo Client instance.
 * The pageProps may contain the Apollo Client, that was generated
 * during the rendering process on the server (SSG/SSR).
 * If the cache from the server is present the Apollo Client in the browser
 * will reuse the existing cache.
 *
 * @param pageProps
 * @param providedApolloClient
 * @returns {ApolloClient<unknown>|ApolloClient<any>}
 */
export function useApollo<P extends unknown>(
  pageProps: P,
  providedApolloClient?: ApolloClient<NormalizedCacheObject>,
): ApolloClient<NormalizedCacheObject> {
  const apolloCache =
    pageProps && pageProps[APOLLO_STATE_PROP_NAME]
      ? pageProps[APOLLO_STATE_PROP_NAME]
      : null
  return useMemo(
    () => providedApolloClient || initializeApollo(apolloCache),
    [apolloCache, providedApolloClient],
  )
}
