import Article from '../components/Article/Page'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { gql } from '@apollo/client'
import { getDocument } from '../components/Article/graphql/getDocument'

type Params = {
  path: string[]
} & ParsedUrlQuery

type Props = {
  payNoteTryOrBuy: number
  payNoteSeed: number
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

const REVALIDATE_SECONDS = 10

export const getStaticProps = createGetStaticProps<Props, Params>(
  async (client, params) => {
    const path = '/' + params.path.join('/')

    const {
      data: { article },
    } = await client.query({
      query: getDocument,
      variables: {
        path,
      },
    })

    if (article) {
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
