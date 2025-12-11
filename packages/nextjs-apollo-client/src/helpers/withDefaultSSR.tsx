import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { getDataFromTree } from '@apollo/client/react/ssr'
import { NextPage, NextPageContext } from 'next'
import { PagePropsWithApollo } from './withApollo'
import {
  APOLLO_STATE_PROP_NAME,
  forwardSSRRequestHeaders,
  InitializeApolloFunc,
} from '../apollo/apolloClient'

/**
 * Default Props used when rendering a page using SSR
 */
type DefaultSSRPageProps<P = unknown> = PagePropsWithApollo<P> & {
  /**
   * UserAgent used during SSR.
   */
  providedUserAgent?: string
  /**
   * NextPageContext available during SSR
   */
  ctx?: NextPageContext
}

/**
 *
 * @param initializeApollo function to retrieve the apollo client
 * @param loadUserIntoCacheFunc function to retrieve the user
 * @deprecated if possible use either getStaticProps or getServerSideProps to fetch the page data.
 */
export function makeWithDefaultSSR(
  initializeApollo: InitializeApolloFunc,
  loadUserIntoCacheFunc?: (
    client: ApolloClient<NormalizedCacheObject>,
  ) => Promise<void>,
) {
  /**
   * HOC that adds a default getInitialProps method to the page-component.
   * The getInitialProps method traverses the Document-Tree during SSR and
   * runs all GraphQL queries (for the logged in user).
   * @param Page
   */
  return function withDefaultSSR(
    Page: NextPage<DefaultSSRPageProps>,
  ): NextPage<DefaultSSRPageProps> {
    // If the page component already has a getInitialProps method make sure to run it.
    const originalGetInitialProps = Page.getInitialProps ?? undefined

    async function getInitialProps(
      ctx: NextPageContext,
    ): Promise<DefaultSSRPageProps> {
      const { AppTree } = ctx
      let props: DefaultSSRPageProps<Record<string, unknown>> = {}
      if (originalGetInitialProps) {
        props = await originalGetInitialProps(ctx)
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      if (!process.browser) {
        props.providedUserAgent = ctx.req.headers['user-agent']

        const apolloClient = initializeApollo(null, {
          headers: forwardSSRRequestHeaders(ctx.req.headers),
          onResponse: (response: Response) => {
            const cookies = response.headers.get('Set-Cookie')
            if (cookies) {
              ctx.res.setHeader('Set-Cookie', cookies)
            }
          },
        })

        try {
          if (loadUserIntoCacheFunc) {
            await loadUserIntoCacheFunc(apolloClient)
          }

          // Run all GraphQL queries with a provided apolloClient
          await getDataFromTree(
            <AppTree
              pageProps={{
                apolloClient: apolloClient,
                serverContext: ctx,
                ...props,
              }}
            />,
          )
        } catch (error) {
          if (error.message !== 'redirect') {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error)
          }
        }

        // Extract query data from the Apollo store
        props[APOLLO_STATE_PROP_NAME] = apolloClient.cache.extract()
      }

      return props
    }

    Page.getInitialProps = getInitialProps

    return Page
  }
}
