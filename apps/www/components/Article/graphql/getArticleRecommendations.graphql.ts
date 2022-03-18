import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { documentFragment } from '../../Feed/fragments'

type GetArticleRecommendationsData = {
  article: {
    id: string
    meta: {
      recommendations: {
        nodes: any[]
      }
    }
  }
}

type GetArticleRecommendationsVariables = {
  path: string
}

export const GET_ARTICLE_SUGGESTIONS = gql`
  query getArticleRecommendations($path: String!) {
    article: document(path: $path) {
      id
      meta {
        recommendations {
          nodes {
            ...FeedDocument
          }
        }
      }
    }
  }
  ${documentFragment}
`

export const useArticleRecommendationsQuery = makeQueryHook<
  GetArticleRecommendationsData,
  GetArticleRecommendationsVariables
>(GET_ARTICLE_SUGGESTIONS)
