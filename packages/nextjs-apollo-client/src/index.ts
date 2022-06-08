import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  ApolloClientOptions,
  useApollo as useApolloHook,
  initializeApollo as initializeApolloFunc,
  InitializeApolloFunc,
} from './apollo/apolloClient'
import makeWithApollo from './helpers/withApollo'

/**
 * Options that must only be provided once per application.
 */
type CreateApolloClientUtilitiesOptions = Pick<
  ApolloClientOptions,
  'apiUrl' | 'wsUrl' | 'mobileConfigOptions'
>

/**
 * Factory function that returns all needed utilities for the Apollo Client
 * with the application specific options.
 * @param options Options that must only be provided once per application.
 */
export function createApolloClientUtilities(
  options: CreateApolloClientUtilitiesOptions,
) {
  const useApollo = <P>(
    pageProps: P,
    providedApolloClient: ApolloClient<NormalizedCacheObject>,
  ): ApolloClient<NormalizedCacheObject> =>
    useApolloHook<P>(pageProps, {
      ...options,
      providedApolloClient,
    })

  const initializeApollo: InitializeApolloFunc = (
    initialCacheObject = null,
    { headers, onResponse },
  ) =>
    initializeApolloFunc(initialCacheObject, {
      ...options,
      headers,
      onResponse,
    })

  const withApollo = makeWithApollo(useApollo)

  return {
    useApollo,
    initializeApollo,
    withApollo,
  }
}

export { hasSubscriptionOperation } from './apollo/apolloLink'
export { APOLLO_STATE_PROP_NAME } from './apollo/apolloClient'
export type { PagePropsWithApollo } from './helpers/withApollo'

export { makeCreateGetStaticProps } from './helpers/createGetStaticProps'
export type { ApolloSSGQueryFunc } from './helpers/createGetStaticProps'

export { makeCreateGetServerSideProps } from './helpers/createGetServerSideProps'
export type { ApolloSSRQueryFunc } from './helpers/createGetServerSideProps'
