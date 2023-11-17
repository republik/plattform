import { gql } from '@apollo/client'

export const ARTICLE_QUERY = gql`
  query articleTeaser($repoId: ID!) {
    article: documents(repoIds: [$repoId]) {
      nodes {
        id
        meta {
          title
          description
          image
          credits
          path
        }
      }
    }
  }
`

export type ArticleQueryResult = {
  article: {
    nodes: {
      id: string
      meta: {
        title?: string
        description?: string
        image?: string
        path: string
        credits?: any
      }
    }[]
  }
}
