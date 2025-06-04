import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

export const MARKETING_PAGE_QUERY = gql`
  query MarketingPage {
    carousel: document(path: "/marketing") {
      id
      content
    }
    carpet: document(path: "/") {
      id
      children(first: 40) {
        nodes {
          body
        }
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
