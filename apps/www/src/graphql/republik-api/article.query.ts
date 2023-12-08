import { gql } from './gql'

export const ARTICLE_QUERY = gql(`
  query articleTeaser($path: String!) {
    article: document(path: $path) {
      meta {
        title
        description
        image
        credits
      }
    }
  }
`)
