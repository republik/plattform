import { gql } from '@apollo/client'
import { ParsedUrlQuery } from 'querystring'
import { getDocument } from '../components/Article/graphql/getDocument'
import Article from '../components/Article/Page'
import { isExternal } from '../components/StatusError'
import { createGetServerSideProps } from '../lib/apollo/helpers'

type Params = {
  path: string[]
} & ParsedUrlQuery

type Props = {
  clientRedirection?: any
}

export const getServerSideProps = createGetServerSideProps<Props, Params>(
  async ({ client, ctx: { params } }) => {
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
        }
      }
      return {
        redirect: {
          destination: redirection.target,
          statusCode: redirection.status,
        },
      }
    }

    return {
      notFound: true,
    }
  },
)

export default Article
