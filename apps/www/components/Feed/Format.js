import React from 'react'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'

import { Center, Interaction } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { parseJSONObject } from '../../lib/safeJSON'

import Box from '../Frame/Box'
import { onDocumentFragment as bookmarkOnDocumentFragment } from '../Bookmarks/fragments'
import { WithoutMembership } from '../Auth/withMembership'

import DocumentListContainer from './DocumentListContainer'

const getFeedDocuments = gql`
  query getFeedDocuments(
    $formatId: String!
    $cursor: String
    $filter: SearchFilterInput
  ) {
    documents(
      format: $formatId
      first: 30
      after: $cursor
      feed: true
      filter: $filter
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
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
  ${bookmarkOnDocumentFragment}
`

const FormatFeed = ({
  t,
  formatId,
  variables = {
    formatId,
  },
}) => {
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
      />
    </Center>
  )
}

export default compose(withT)(FormatFeed)
