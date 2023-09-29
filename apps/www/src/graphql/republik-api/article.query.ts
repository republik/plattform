import { gql } from './gql'

export const ARTICLE_TEASER_QUERY = gql(`
  query articleTeaser($path: String!) {
    article: document(path: $path) {
      meta {
        title
        shortTitle
        image
        credits
      }
    }
  }
`)
