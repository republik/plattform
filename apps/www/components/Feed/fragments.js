import { onDocumentFragment as bookmarkOnDocumentFragment } from '../Bookmarks/fragments'

export const documentFragment = `
  fragment FeedDocument on Document {
    id
    repoId
    ...BookmarkOnDocument
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
        }
      }
      ownDiscussion {
        id
        path
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
`
