import { ParsedUrlQuery } from 'querystring'
import {
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  APOLLO_STATE_PROP_NAME,
  InitializeApolloFunc,
} from '../apollo/apolloClient'
import { PagePropsWithApollo } from './withApollo'

export type GetStaticPathsWithApollo<Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  ctx: GetStaticPathsContext,
) => Promise<GetStaticPathsResult<Q>>

export type GetStaticPropsWithApollo<P, Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
) => Promise<GetStaticPropsResult<P>>

/**
 * Returns a function that take a `GetStaticPropsWithApollo` and returns a `GetStaticPropsResult`.
 * The `GetStaticPropsWithApollo` has access to the `getStaticProps` parameters as well as to an Apollo client instance.
 * @param initializeApollo function to retrieve the apollo client
 */
export function makeSSGDataFetchingHelpers(
  initializeApollo: InitializeApolloFunc,
) {
  /**
   * createGetStaticPaths returns a getStaticPaths-function that may fetch
   * data from the graphql api.
   * @param queryFunc function where you query the graphql api
   * @param headers headers to be passed to the apollo client
   */
  function createGetStaticPaths<Q extends ParsedUrlQuery = ParsedUrlQuery>(
    queryFunc: GetStaticPathsWithApollo<Q>,
    headers?: { [key: string]: string },
  ): GetStaticPaths<Q> {
    return async (context) => {
      const client = initializeApollo(null, {
        headers,
      })
      const result = await queryFunc(client, context)
      return result
    }
  }

  /**
   * createGetStaticProps returns a getStaticProps-function that may fetch data
   * from the graphql api.
   * @param queryFunc function where you query the graphql api
   * @param headers headers to be passed to the apollo client
   */
  function createGetStaticProps<P, Q extends ParsedUrlQuery = ParsedUrlQuery>(
    queryFunc: GetStaticPropsWithApollo<P, Q>,
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

  return {
    createGetStaticPaths,
    createGetStaticProps,
  }
}
