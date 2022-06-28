import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useMemo } from 'react'
import {
  APOLLO_STATE_PROP_NAME,
  ApolloClientOptions,
  initializeApollo,
} from './apolloClient'

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
function useApollo<P>(
  pageProps: P,
  options: ApolloClientOptions & {
    providedApolloClient?: ApolloClient<NormalizedCacheObject>
  },
): ApolloClient<NormalizedCacheObject> {
  const apolloCache =
    pageProps && pageProps[APOLLO_STATE_PROP_NAME]
      ? pageProps[APOLLO_STATE_PROP_NAME]
      : null
  return useMemo(
    () =>
      options?.providedApolloClient || initializeApollo(apolloCache, options),
    [apolloCache, options],
  )
}

export default useApollo
