import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Loader from '../Loader'
import DocumentList from './DocumentList'

import { documentFragment } from './fragments'
import { useQuery } from '@apollo/client'

export const documentListQueryFragment = `
  fragment DocumentListConnection on DocumentConnection {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      ...FeedDocument
    }
  }
  ${documentFragment}
`

const defaultProps = {
  getConnection: (data) => data.documents,
  mergeConnection: (data, connection) => ({
    ...data,
    documents: connection,
  }),
  mapNodes: (e) => e,
  variables: {},
  placeholder: null,
}

export const makeLoadMore =
  ({
    fetchMore,
    connection,
    getConnection = defaultProps.getConnection,
    mergeConnection = defaultProps.mergeConnection,
    mapNodes = defaultProps.mapNodes,
    variables,
  }) =>
  () =>
    fetchMore({
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const prevCon = getConnection(previousResult)
        const moreCon = getConnection(fetchMoreResult)
        const nodes = [...prevCon.nodes, ...moreCon.nodes]
          .filter((node) => mapNodes(node))
          .filter(
            // deduplicating due to off by one in pagination API
            (node, index, all) =>
              all.findIndex((n) => mapNodes(n).id === mapNodes(node).id) ===
              index,
          )
        return mergeConnection(fetchMoreResult, {
          ...prevCon,
          ...moreCon,
          nodes,
        })
      },
      variables: {
        ...variables,
        cursor: connection.pageInfo.endCursor,
      },
    })

const DocumentListContainer = ({
  query,
  variables,
  getConnection,
  mergeConnection,
  mapNodes,
  placeholder,
  help,
  empty,
  feedProps,
  refetchOnUnmount,
  showTotal,
}) => {
  const { loading, error, data, fetchMore, refetch } = useQuery(query, {
    variables,
  })

  useEffect(() => {
    if (refetchOnUnmount) {
      return () => {
        refetch()
      }
    }
  }, [refetchOnUnmount])
  if (process.browser) {
    window.refetch = refetch
  }

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const connection = getConnection(data)
        const isEmpty = connection.totalCount < 1
        if (isEmpty) {
          return placeholder
        } else {
          const hasMore = connection.pageInfo.hasNextPage
          return (
            <DocumentList
              documents={connection.nodes.map(mapNodes).filter(Boolean)}
              totalCount={connection.totalCount}
              hasMore={hasMore}
              loadMore={makeLoadMore({
                fetchMore,
                connection,
                getConnection,
                mergeConnection,
                mapNodes,
                variables,
              })}
              feedProps={feedProps}
              showTotal={showTotal}
              help={help}
              empty={empty}
              variables={variables}
            />
          )
        }
      }}
    />
  )
}

DocumentListContainer.defaultProps = defaultProps

DocumentListContainer.propTypes = {
  query: PropTypes.object.isRequired,
  variables: PropTypes.object,
  getConnection: PropTypes.func.isRequired,
  mapNodes: PropTypes.func.isRequired,
  placeholder: PropTypes.element,
  refetchOnUnmount: PropTypes.bool,
  showTotal: PropTypes.bool,
  help: PropTypes.element,
}

export default DocumentListContainer
