import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const MARKETING_PAGE_QUERY = gql`
  query MarketingPage {
    # Used in MinifFront.js
    miniFront: document(path: "/marketing") {
      id
      children {
        totalCount
        nodes {
          id
          body
        }
      }
      meta {
        prepublication
        lastPublishedAt
      }
    }
    carpet: document(path: "/") {
      id
      children(first: 40) {
        nodes {
          body
        }
      }
    }
    team: employees(withBoosted: true, shuffle: 3, withPitch: true) {
      title
      name
      group
      subgroup
      pitch
      user {
        id
        portrait
        slug
      }
    }
    featuredComments: comments(
      orderBy: FEATURED_AT
      orderDirection: DESC
      first: 2
      featuredTarget: MARKETING
    ) {
      id
      nodes {
        id
        featuredText
        createdAt
        updatedAt
        displayAuthor {
          id
          name
          slug
          credential {
            id
            description
            verified
          }
          profilePicture
        }
        discussion {
          id
          title
          path
          comments(first: 0) {
            totalCount
          }
          document {
            id
            meta {
              format {
                id
              }
              path
              image
              shareText
            }
          }
        }
      }
    }
  }
`

export const useMarketingPageQuery = makeQueryHook(MARKETING_PAGE_QUERY)
