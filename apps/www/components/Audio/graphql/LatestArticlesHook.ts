import { gql } from '@apollo/client'
import { AudioQueueItem } from './AudioQueueHooks'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const LATEST_ARTICLE_QUERIES = gql`
  query LatestArticles($count: Int!) {
    latestArticles: documents(first: $count) {
      nodes {
        id
        meta {
          title
          path
          publishDate
          image
          audioSource {
            mediaId
            kind
            mp3
            aac
            ogg
            durationMs
            userProgress {
              id
              secs
            }
          }
        }
      }
    }
  }
`

type LatestArticleQueryVariables = {
  count: number
}

type LatestArticleQueryData = {
  latestArticles: {
    nodes: AudioQueueItem['document'][]
  }
}

export const useLatestArticlesQuery = makeQueryHook<
  LatestArticleQueryData,
  LatestArticleQueryVariables
>(LATEST_ARTICLE_QUERIES)
