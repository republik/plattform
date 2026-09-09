import { onDocumentFragment as bookmarkOnDocumentFragment } from '@/components/Bookmarks/fragments'
import { gql } from '@apollo/client'

export const documentFragment = `
  fragment FeedDocument on Document {
    id
    repoId
    ...BookmarkOnDocument
    userProgress {
      id
      max {
        percentage
      }
    }
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
    }
  }
  ${bookmarkOnDocumentFragment}
`

const documentListQueryFragment = `
  fragment DocumentListConnection on DocumentConnection {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      ...FeedDocument
    }
  }
  ${documentFragment}
`

const getPublicUser = gql`
  query getPublicUser(
    $slug: String!
    $firstDocuments: Int!
    $firstComments: Int!
    $afterDocument: String
    $afterComment: String
  ) {
    user(slug: $slug) {
      id
      slug
      username
      firstName
      lastName
      updatedAt
      name
      email
      emailAccessRole
      phoneNumber
      phoneNumberNote
      phoneNumberAccessRole
      portrait
      hasPublicProfile
      isEligibleForProfile
      statement
      biography
      biographyContent
      isListed
      isAdminUnlisted
      sequenceNumber
      pgpPublicKey
      pgpPublicKeyId
      credentials {
        isListed
        description
        verified
      }
      profileUrls
      prolitterisId
      documents(first: $firstDocuments, after: $afterDocument) {
        ...DocumentListConnection
      }
      subscribedBy(onlyMe: true) {
        nodes {
          id
          active
          filters
          isEligibleForNotifications
        }
      }
      comments(first: $firstComments, after: $afterComment) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          published
          adminUnpublished
          preview(length: 210) {
            string
            more
          }
          tags
          parentIds
          discussion {
            id
            title
            path
            document {
              id
              meta {
                title
                path
                template
                ownDiscussion {
                  id
                  path
                  closed
                }
                linkedDiscussion {
                  id
                  path
                  closed
                }
              }
            }
          }
          createdAt
        }
      }
    }
  }
  ${documentListQueryFragment}
`

export default getPublicUser
