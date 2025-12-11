import Article from '../components/Article/Page'
import { GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { gql } from '@apollo/client'
import { getDocument } from '../components/Article/graphql/getDocument'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { isExternal } from '../components/StatusError'

type Params = {
  path: string[]
} & ParsedUrlQuery

type Props = {
  clientRedirection?: any
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

const REVALIDATE_SECONDS = 10

export const getStaticProps = createGetStaticProps<Props, Params>(
  async (client, { params }) => {
    const path = '/' + params.path.join('/')

    const {
      data: { article },
    } = await client.query({
      query: getDocument,
      variables: {
        path,
      },
      // Ignore graphQLErrors and let the client handle/report them.
      errorPolicy: 'ignore',
    })

    if (article) {
      return {
        revalidate: REVALIDATE_SECONDS,
        props: {},
      }
    }

    const {
      data: { redirection },
    } = await client.query({
      query: gql`
        query getRedirect($path: String!) {
          redirection(path: $path) {
            target
            status
          }
        }
      `,
      variables: {
        path,
      },
    })

    if (redirection) {
      if (isExternal(redirection.target)) {
        return {
          props: {
            clientRedirection: redirection,
          },
          revalidate: REVALIDATE_SECONDS,
        }
      }
      return {
        revalidate: REVALIDATE_SECONDS,
        redirect: {
          destination: redirection.target,
          statusCode: redirection.status,
        },
      }
    }

    return {
      notFound: true,
      revalidate: REVALIDATE_SECONDS,
    }
  },
)

export default Article
