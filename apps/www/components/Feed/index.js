import { useEffect } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { gql, useQuery } from '@apollo/client'
import Frame from '../Frame'
import withT from '../../lib/withT'
import { reportError } from '../../lib/errors/reportError'
import withInNativeApp from '../../lib/withInNativeApp'
import Loader from '../Loader'

import { mediaQueries, Center, Interaction } from '@project-r/styleguide'
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
    greeting {
      text
      id
    }
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

const greetingSubscription = gql`
  subscription {
    greeting {
      id
      text
    }
  }
`

const Feed = ({ meta }) => {
  const { error, loading, data, fetchMore, subscribeToMore } = useQuery(query, {
    // When graphQLErrors happen, we still want to get partial data to render the feed
    errorPolicy: 'all',
  })

  if (error) {
    reportError('Feed getFeed Query', error)
  }

  const connection = data?.documents
  const greeting = data?.greeting

  const mapNodes = (node) => node.entity

  useEffect(() => {
    if (!subscribeToMore) {
      return
    }
    let unsubscribe = subscribeToMore({
      document: greetingSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const { greeting } = subscriptionData.data.greeting
        if (greeting) {
          return {
            ...prev,
            greeting: {
              ...greeting,
            },
          }
        } else {
          return prev
        }
      },
    })
    return () => {
      unsubscribe()
    }
  }, [subscribeToMore])

  return (
    <Frame hasOverviewNav stickySecondaryNav raw meta={meta}>
      <Center {...styles.container}>
        <Loader
          loading={loading}
          render={() => {
            return (
              <>
                {greeting && (
                  <Interaction.H1 style={{ marginBottom: '40px' }}>
                    {greeting.text}
                  </Interaction.H1>
                )}

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
