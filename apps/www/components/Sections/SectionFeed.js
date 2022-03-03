import React from 'react'
import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'

import { Center } from '@project-r/styleguide'

import withT from '../../lib/withT'

import DocumentListContainer from '../Feed/DocumentListContainer'
import { documentFragment } from '../Feed/fragments'

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
          ...FeedDocument
        }
      }
    }
  }
  ${documentFragment}
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
