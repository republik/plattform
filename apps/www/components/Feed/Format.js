import React from 'react'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'

import { Center, Interaction } from '@project-r/styleguide'

import withT from '../../lib/withT'

import Box from '../Frame/Box'
import { onDocumentFragment as bookmarkOnDocumentFragment } from '../Bookmarks/fragments'
import { WithoutMembership } from '../Auth/withMembership'

import DocumentListContainer from './DocumentListContainer'

const getFeedDocuments = gql`
  query getFeedDocuments(
    $cursor: String
    $processor: SearchProcessor
    $filter: SearchFilterInput
    $filters: [SearchGenericFilterInput!]
  ) {
    documents: search(
      after: $cursor
      processor: $processor
      filter: $filter
      filters: $filters
      sort: { key: publishedAt, direction: DESC }
      first: 30
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

const FormatFeed = ({ t, formatId, variables: variablesObject }) => {
  if (!variablesObject && !formatId) {
    return null
  }

  const variables = variablesObject || {
    processor: 'formatFeedSamples',
    filter: { format: formatId, feed: true },
  }

  const empty = (
    <WithoutMembership
      render={() => (
        <Box style={{ marginBottom: 30, padding: '15px 20px' }}>
          <Interaction.P>{t('section/feed/payNote')}</Interaction.P>
        </Box>
      )}
    />
  )

  return (
    <Center>
      <DocumentListContainer
        feedProps={{ showHeader: false }}
        empty={empty}
        showTotal={true}
        query={getFeedDocuments}
        variables={variables}
        mapNodes={mapNodes}
      />
    </Center>
  )
}

export default compose(withT)(FormatFeed)
