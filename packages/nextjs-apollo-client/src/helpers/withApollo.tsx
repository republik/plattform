import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client'
import { AppProps } from 'next/app'
import { APOLLO_STATE_PROP_NAME } from '../apollo/apolloClient'
import { ComponentType } from 'react'

export type PagePropsWithApollo<P = unknown> = {
  /**
   * Shared cache between the client and server
   */
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject
  /**
   * Potential apollo-client received from the server.
   */
  apolloClient?: ApolloClient<NormalizedCacheObject>
} & P

/**
 * HOC to wrap a Next.js App with an ApolloProvider.
 * @param useApollo hook to retrieve the apollo client
 * @returns App wrapped with ApolloProvider with the cache from the server being injected.
 */
function makeWithApollo(
  useApollo: (
    pageProps: PagePropsWithApollo,
    providedApolloClient: ApolloClient<NormalizedCacheObject>,
  ) => ApolloClient<NormalizedCacheObject>,
) {
  /**
   * HOC to inject the next.js app with the apollo client cache received from the server.
   * @param AppComponent
   */
  return function withApollo<P>(
    AppComponent: ComponentType<AppProps<PagePropsWithApollo<P>>>,
  ): ComponentType<AppProps<PagePropsWithApollo<P>>> {
    const WrappedApp = ({
      Component,
      pageProps,
      ...appProps
    }: AppProps<PagePropsWithApollo<P>>) => {
      const {
        apolloClient: providedApolloClient,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [APOLLO_STATE_PROP_NAME]: apolloState,
        ...filteredPageProps // Filtered PageProps
      } = pageProps

      const apolloClient = useApollo(pageProps, providedApolloClient)
      return (
        <ApolloProvider client={apolloClient}>
          <AppComponent
            Component={Component}
            pageProps={filteredPageProps as P}
            {...appProps}
          />
        </ApolloProvider>
      )
    }

    WrappedApp.displayName = `withApollo(${AppComponent.displayName})`

    return WrappedApp
  }
}

export default makeWithApollo
