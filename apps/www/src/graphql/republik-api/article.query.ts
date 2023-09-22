import { gql } from '@apollo/client'

export const ARTICLE_QUERY = gql`
  query articleTeaser($path: String!) {
    article: document(path: $path) {
      meta {
        title
        shortTitle
      }
    }
  }
`

export type ArticleQueryResult = {
  article?: {
    meta: { title?: string; shortTitle?: string; image?: string; credits?: any }
  }
}
