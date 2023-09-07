import { gql } from '@/generated/graphql'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { documentFragment } from '../../Feed/fragments'

type GetArticleRecommendationsData = {
  article?: {
    id: string
    meta: {
      recommendations?: {
        nodes: any[]
      }
    }
  }
}

type GetArticleRecommendationsVariables = {
  path: string
}

export const GET_ARTICLE_SUGGESTIONS = gql(`
  ${documentFragment}
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
`)

export const useArticleRecommendationsQuery = makeQueryHook<
  GetArticleRecommendationsData,
  GetArticleRecommendationsVariables
>(GET_ARTICLE_SUGGESTIONS)
