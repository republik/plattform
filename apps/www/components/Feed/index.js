import React, { useEffect, useRef } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { css } from 'glamor'
import { gql } from '@apollo/client'
import Frame from '../Frame'
import withT from '../../lib/withT'
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

const Feed = ({
  meta,
  data: {
    error,
    loading,
    greeting,
    documents: connection,
    fetchMore,
    subscribeToMore,
  },
}) => {
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
          error={error}
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

export default compose(graphql(query), withT, withInNativeApp)(Feed)
