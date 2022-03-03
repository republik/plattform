import React from 'react'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'

import { Center } from '@project-r/styleguide'

import withT from '../../lib/withT'

import { onDocumentFragment as bookmarkOnDocumentFragment } from '../Bookmarks/fragments'

import DocumentListContainer from '../Feed/DocumentListContainer'

const getFeedDocuments = gql`
  query getSectionDocuments(
    $cursor: String
    $filter: SearchFilterInput
    $filters: [SearchGenericFilterInput!]
  ) {
    documents: search(
      filters: $filters
      filter: $filter
      sort: { key: publishedAt, direction: DESC }
      first: 30
      after: $cursor
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        entity {
          ... on Document {
            id
            ...BookmarkOnDocument
            meta {
              credits
              title
              description
              publishDate
              path
              template
              format {
                id
                meta {
                  kind
                  color
                  title
                  path
                }
              }
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
            }
          }
        }
      }
    }
  }
  ${bookmarkOnDocumentFragment}
`

const mapNodes = (node) => node.entity

const SectionFeed = ({ t, formats, variables: variablesObject }) => {
  if (!variablesObject && !(formats && formats.length)) {
    return null
  }

  const variables = variablesObject || {
    filter: { formats, feed: true },
  }

  return (
    <Center>
      <DocumentListContainer
        feedProps={{ showHeader: false }}
        showTotal={true}
        query={getFeedDocuments}
        variables={variables}
        mapNodes={mapNodes}
      />
    </Center>
  )
}

export default compose(withT)(SectionFeed)
