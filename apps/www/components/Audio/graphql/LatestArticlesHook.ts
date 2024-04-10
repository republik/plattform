import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { AudioQueueItem } from '../types/AudioPlayerItem'

const LATEST_ARTICLE_QUERIES = gql`
  query LatestArticles($count: Int!, $after: String) {
    latestArticles: documents(first: $count, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        meta {
          title
          path
          publishDate
          image
          audioCoverCrop {
            x
            y
            width
            height
          }
          coverSm: audioCover(properties: { width: 128, height: 128 })
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
          format {
            id
            meta {
              title
              color
              shareLogo
              shareBackgroundImage
              shareBackgroundImageInverted
            }
          }
        }
      }
    }
  }
`

export type LatestArticleQueryVariables = {
  count: number
  after?: string
}

export type LatestArticleQueryData = {
  latestArticles: {
    pageInfo: {
      hasNextPage: boolean
      endCursor: string
    }
    nodes: Omit<AudioQueueItem['document'], 'coverMd' | 'coverForNativeApp'>[]
  }
}

export const useLatestArticlesQuery = makeQueryHook<
  LatestArticleQueryData,
  LatestArticleQueryVariables
>(LATEST_ARTICLE_QUERIES)
