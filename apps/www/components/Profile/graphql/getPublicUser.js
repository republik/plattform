import { gql } from '@apollo/client'
import { documentListQueryFragment } from '../../Feed/DocumentListContainer'

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
