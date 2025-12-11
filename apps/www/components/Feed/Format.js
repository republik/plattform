import compose from 'lodash/flowRight'
import { gql } from '@apollo/client'

import { Center } from '@project-r/styleguide'

import withT from '../../lib/withT'

import DocumentListContainer from './DocumentListContainer'
import { documentFragment } from './fragments'

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
      first: 20
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

const FormatFeed = ({ t, formatId, variables: variablesObject }) => {
  if (!variablesObject && !formatId) {
    return null
  }

  const variables = variablesObject || {
    processor: 'formatFeedSamples',
    filter: { format: formatId, feed: true },
  }

  return (
    <Center>
      <DocumentListContainer
        feedProps={{ showHeader: false, skipFormat: true }}
        showTotal={true}
        query={getFeedDocuments}
        variables={variables}
        mapNodes={mapNodes}
      />
    </Center>
  )
}

export default compose(withT)(FormatFeed)
