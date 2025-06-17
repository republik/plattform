import { gql } from '@apollo/client'
import { onDocumentFragment } from '../../Bookmarks/fragments'
import { userProgressFragment } from '../Progress/api'
import { notificationInfo, subInfo } from '../../Notifications/enhancers'

export const getDocument = gql`
  query getDocument($path: String!) {
    article: document(path: $path) {
      id
      type
      repoId
      content
      issuedForUserId
      subscribedBy(includeParents: true, onlyMe: true) {
        nodes {
          ...subInfo
        }
      }
      linkedDocuments {
        nodes {
          id
          meta {
            title
            template
            path
            color
          }
          linkedDocuments(feed: true) {
            totalCount
          }
        }
      }
      unreadNotifications {
        nodes {
          ...notificationInfo
        }
      }
      ...BookmarkOnDocument
      ...UserProgressOnDocument
      meta {
        publishDate
        lastPublishedAt
        template
        path
        title
        kind
        description
        image
        facebookTitle
        facebookImage
        facebookDescription
        twitterTitle
        twitterImage
        twitterDescription
        seoTitle
        seoDescription
        shareText
        shareFontSize
        shareInverted
        shareTextPosition
        ownDiscussion {
          id
          path
          closed
          isBoard
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
        color
        contributors {
          name
          kind
          user {
            id
            username
            slug
            profileUrls
          }
        }
        isPaywallExcluded
        format {
          id
          meta {
            path
            externalBaseUrl
            title
            color
            kind
            image
            shareLogo
            shareBackgroundImage
            shareBackgroundImageInverted
            section {
              id
              meta {
                title
              }
            }
            podcast {
              podigeeSlug
              spotifyUrl
              googleUrl
              appleUrl
            }
            newsletter {
              name
              free
            }
            isPaywallExcluded
          }
        }
        section {
          id
          meta {
            path
            title
            color
            kind
          }
        }
        dossier {
          id
          meta {
            title
            path
          }
        }
        series {
          title
          description
          logo
          logoDark
          overview {
            id
            repoId
            meta {
              path
            }
          }
          episodes {
            title
            publishDate
            label
            lead
            image
            document {
              id
              repoId
              ...BookmarkOnDocument
              ...UserProgressOnDocument
              meta {
                title
                publishDate
                path
                image
                template
                estimatedReadingMinutes
                estimatedConsumptionMinutes
                audioSource {
                  mp3
                  aac
                  ogg
                  mediaId
                  durationMs
                  kind
                }
                ownDiscussion {
                  id
                  path
                  closed
                  isBoard
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
          }
        }
        audioSource {
          mp3
          aac
          ogg
          mediaId
          durationMs
          kind
        }
        podcast {
          podigeeSlug
          spotifyUrl
          googleUrl
          appleUrl
        }
        willBeReadAloud
        newsletter {
          name
          free
        }
        disableActionBar
        estimatedReadingMinutes
        estimatedConsumptionMinutes
        indicateGallery
        indicateVideo
        prepublication
      }
    }
  }
  ${onDocumentFragment}
  ${userProgressFragment}
  ${subInfo}
  ${notificationInfo}
`
