import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client'
import { AppProps } from 'next/app'
import { APOLLO_STATE_PROP_NAME } from './apolloClient'
import { ComponentType } from 'react'

export type PagePropsWithCache<P = unknown> = {
  /**
   * Shared cache between the client and server
   */
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject
  /**
   * Potential apollo-client received from the server.
   */
  apolloClient?: ApolloClient<NormalizedCacheObject>
} & P

function makeWithApollo<P>(
  useApollo: (
    pageProps: P,
    providedApolloClient: ApolloClient<NormalizedCacheObject>,
  ) => ApolloClient<NormalizedCacheObject>,
) {
  /**
   * HOC to inject the next.js app with the apollo client cache received from the server.
   * @param AppComponent
   */
  return function withApollo<P>(
    AppComponent: ComponentType<AppProps<PagePropsWithCache<P>>>,
  ): ComponentType<AppProps<PagePropsWithCache<P>>> {
    const WrappedApp = ({
      Component,
      pageProps,
      ...appProps
    }: AppProps<PagePropsWithCache<P>>) => {
      const {
        apolloClient: providedApolloClient,
        [APOLLO_STATE_PROP_NAME]: apolloState,
        ...filteredPageProps // Filtered PageProps
      } = pageProps

      const apolloClient = useApollo(pageProps, providedApolloClient)
      return (
        <ApolloProvider client={apolloClient}>
          <AppComponent
            Component={Component}
            pageProps={filteredPageProps}
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
