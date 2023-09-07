import { gql } from '@/generated/graphql'
import { onDocumentFragment as bookmarkOnDocumentFragment } from '../Bookmarks/fragments'

const userProgressFragment = gql(`
  fragment UserProgressOnDocument on Document {
    userProgress {
      id
      percentage
      nodeId
      updatedAt
      max {
        id
        percentage
        updatedAt
      }
    }
  }
`)

export const documentFragment = gql(`
  fragment FeedDocument on Document {
    id
    repoId
    ...BookmarkOnDocument
    ...UserProgressOnDocument
    meta {
      credits
      title
      description
      publishDate
      prepublication
      path
      kind
      template
      color
      estimatedReadingMinutes
      estimatedConsumptionMinutes
      indicateChart
      indicateGallery
      indicateVideo
      audioSource {
        mp3
        aac
        ogg
        mediaId
        durationMs
        kind
      }
      dossier {
        id
      }
      format {
        id
        meta {
          path
          title
          color
          kind
          externalBaseUrl
        }
      }
      ownDiscussion {
        id
        closed
        comments {
          totalCount
        }
      }
      linkedDiscussion {
        id
        path
        closed
        comments {
          totalCount
        }
      }
      series {
        title
        episodes {
          label
          document {
            id
            repoId
            meta {
              path
            }
          }
        }
      }
    }
  }
  ${bookmarkOnDocumentFragment}
  ${userProgressFragment}
`)
