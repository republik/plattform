import { useEffect } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { gql, useQuery } from '@apollo/client'
import Frame from '../Frame'
import withT from '../../lib/withT'
import { reportError } from '../../lib/errors/reportError'
import withInNativeApp from '../../lib/withInNativeApp'
import Loader from '../Loader'

import { mediaQueries, Center } from '@project-r/styleguide'
import DocumentList from './DocumentList'
import { makeLoadMore } from './DocumentListContainer'
import { documentFragment } from './fragments'

const styles = {
  container: css({
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 40,
    },
  }),
}

const query = gql`
  query getFeed($cursor: String) {
    documents: search(
      filters: [
        { key: "template", not: true, value: "section" }
        { key: "template", not: true, value: "format" }
        { key: "template", not: true, value: "front" }
      ]
      filter: { feed: true }
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

const Feed = ({ meta }) => {
  const { error, loading, data, fetchMore } = useQuery(query, {
    // When graphQLErrors happen, we still want to get partial data to render the feed
    errorPolicy: 'all',
  })

  useEffect(() => {
    if (error) {
      reportError('Feed getFeed Query', error)
    }
  }, [reportError, error])

  const connection = data?.documents

  const mapNodes = (node) => node.entity

  return (
    <Frame hasOverviewNav stickySecondaryNav raw meta={meta}>
      <Center {...styles.container}>
        <Loader
          loading={loading}
          render={() => {
            return (
              <>
                <DocumentList
                  documents={connection.nodes.map(mapNodes)}
                  totalCount={connection.totalCount}
                  hasMore={connection.pageInfo.hasNextPage}
                  loadMore={makeLoadMore({
                    fetchMore,
                    connection,
                    mapNodes,
                  })}
                />
              </>
            )
          }}
        />
      </Center>
    </Frame>
  )
}

export default compose(withT, withInNativeApp)(Feed)
