import { ParsedUrlQuery } from 'querystring'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { meQuery } from '../apollo/withMe'
import { MeObjectType } from '../context/MeContext'
import { initializeApollo } from '../apollo'
import {
  APOLLO_STATE_PROP_NAME,
  PagePropsWithApollo,
} from '@republik/nextjs-apollo-client'

/**
 * Type of function that can be passed to `createGetServerSideProps`
 */
type ApolloSSRQueryFunc<P, Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
  user: MeObjectType | null,
  ctx: GetServerSidePropsContext<Q>,
) => Promise<GetServerSidePropsResult<P>>

function createGetServerSideProps<P, Q extends ParsedUrlQuery = ParsedUrlQuery>(
  queryFunc: ApolloSSRQueryFunc<P, Q>,
): GetServerSideProps<PagePropsWithApollo<P>> {
  return async (
    context: GetServerSidePropsContext<Q>,
  ): Promise<GetServerSidePropsResult<PagePropsWithApollo<P>>> => {
    // Use the request object to pass on the cookies to the graphql requests
    const apolloClient = initializeApollo(null, {
      // Pass headers of the client-request to the apollo-link
      headers: context.req.headers,
      onResponse: (response) => {
        // headers.raw() is a node-fetch specific API and apparently the only way to get multiple cookies
        // https://github.com/bitinn/node-fetch/issues/251
        const cookies = response.headers.raw()['set-cookie']
        if (cookies) {
          context.res.setHeader('Set-Cookie', cookies)
        }
      },
    })

    // Request the user object to attach it to the query-func
    // as well as adding it to the apollo-client cache
    const {
      data: { me },
    } = await apolloClient.query<{ me?: MeObjectType }>({
      query: meQuery,
    })

    const result = await queryFunc(apolloClient, context.params, me, context)

    if ('redirect' in result || 'notFound' in result) {
      return result
    }

    result.props[APOLLO_STATE_PROP_NAME] = apolloClient.cache.extract()
    return result
  }
}

export default createGetServerSideProps
