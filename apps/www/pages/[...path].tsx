import Article from '../components/Article/Page'
import { GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { gql } from '@apollo/client'
import { getDocument } from '../components/Article/graphql/getDocument'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { isExternal } from '../components/StatusError'
import { DocumentDiscussionIdDocument } from '@app/graphql/republik-api/gql/graphql'

type Params = {
  path: string[]
} & ParsedUrlQuery

type Props = {
  payNoteTryOrBuy?: number
  payNoteSeed?: number
  clientRedirection?: unknown
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
    const pathParts = params.path
    const path = '/' + pathParts.join('/')

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

    if (article && !article.meta.format?.meta.externalBaseUrl) {
      return {
        props: {
          payNoteTryOrBuy: Math.random(),
          payNoteSeed: Math.random(),
        },
        revalidate: REVALIDATE_SECONDS,
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

    /**
     * In case an article is not found and the sufix of the path is `/dialog`
     * we check if the article has a discussion and redirect to the discussion.
     *
     * !!! This only works for documents that use the article template!
     *
     */
    if (path.endsWith('/dialog')) {
      const path = '/' + pathParts.slice(0, -1).join('/')
      const discussionIdResult = await client.query({
        query: DocumentDiscussionIdDocument,
        variables: { path },
      })

      if (
        discussionIdResult.data.document?.meta.template === 'article' &&
        discussionIdResult.data.document?.meta.ownDiscussion?.id
      ) {
        return {
          redirect: {
            destination: `/dialog?t=article&id=${discussionIdResult.data.document.meta.ownDiscussion.id}`,
            permanent: false,
          },
          revalidate: REVALIDATE_SECONDS,
        }
      }
    }

    return {
      notFound: true,
      revalidate: REVALIDATE_SECONDS,
    }
  },
)

export default Article
