import { ParsedUrlQuery } from 'querystring'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { BasePageProps } from '../../pages/_app'
import {
  APOLLO_STATE_PROP_NAME,
  initializeApollo,
} from '../apollo/apolloClient'

/**
 * Type of function that can be passed to `createGetServerSideProps`
 */
type ApolloSSRQueryFunc<P, Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
) => Promise<GetServerSidePropsResult<P>>

function createGetServerSideProps<P, Q extends ParsedUrlQuery = ParsedUrlQuery>(
  queryFunc: ApolloSSRQueryFunc<P, Q>,
): GetServerSideProps<BasePageProps<P>> {
  return async (
    context: GetServerSidePropsContext<Q>,
  ): Promise<GetServerSidePropsResult<BasePageProps<P>>> => {
    // Use the request object to pass on the cookies to the graphql requests
    const apolloClient = initializeApollo(null, {
      // Pass headers of the client-request to the apollo-link
      headers: context.req.headers,
    })

    const result = await queryFunc(apolloClient, context.params)

    if ('props' in result) {
      result.props[APOLLO_STATE_PROP_NAME] = apolloClient.cache.extract()
    }

    return result
  }
}

export default createGetServerSideProps
