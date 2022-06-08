import { ParsedUrlQuery } from 'querystring'
import {
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  APOLLO_STATE_PROP_NAME,
  PagePropsWithApollo,
} from '@republik/nextjs-apollo-client'
import { InitializeApolloFunc } from '../apollo/apolloClient'

/**
 * A function that is able to interact with the apollo-client
 */
export type ApolloSSGQueryFunc<P, Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
) => Promise<GetStaticPropsResult<P>>

/**
 * Returns a function that take a `ApolloSSGQueryFunc` and returns a `GetStaticPropsResult`.
 * The `ApolloSSGQueryFunc` has access to the `getStaticProps` parameters as well as to an Apollo client instance.
 * @param initializeApollo function to retrieve the apollo client
 */
export function makeCreateGetStaticProps(
  initializeApollo: InitializeApolloFunc,
) {
  /**
   * createGetStaticProps returns a getStaticProps-function that may fetch data
   * from the graphql api.
   * @param queryFunc
   */
  return function createGetStaticProps<
    P,
    Q extends ParsedUrlQuery = ParsedUrlQuery,
  >(
    queryFunc: ApolloSSGQueryFunc<P, Q>,
    headers?: { [key: string]: string },
  ): GetStaticProps<PagePropsWithApollo<P>> {
    return async (
      ctx: GetStaticPropsContext<Q>,
    ): Promise<GetStaticPropsResult<PagePropsWithApollo<P>>> => {
      const apolloClient = initializeApollo(null, {
        headers,
      })
      const result = await queryFunc(apolloClient, ctx.params)

      // Return result directly if not successful getStaticProps-result
      if ('redirect' in result || 'notFound' in result) {
        return result
      }

      return {
        props: {
          ...result.props,
          [APOLLO_STATE_PROP_NAME]: apolloClient.cache.extract(),
          assumeAccess: !!headers?.authorization,
        },
        revalidate: result.revalidate,
      }
    }
  }
}
