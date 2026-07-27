import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useApolloClient } from '@apollo/client'
import { withTypesenseClient } from './typesenseKey'
import { runSearch, enrichDocumentNodes, filterToKind } from './typesenseAdapter'

// Minimal shared cache so multiple mounted consumers of the same
// (searchQuery, filter, sort) combination (index.js, Filters.js, Results.js
// all compose withAggregations/withResults independently) share one
// in-flight/-flight request instead of each firing its own, mirroring
// Apollo's query deduplication that the old GraphQL-backed version got for
// free.
const cache = new Map()
const listeners = new Map()

const notify = (key) => listeners.get(key)?.forEach((listener) => listener())

const subscribe = (key) => (onStoreChange) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set())
  }
  listeners.get(key).add(onStoreChange)
  return () => listeners.get(key)?.delete(onStoreChange)
}

const setEntry = (key, entry) => {
  cache.set(key, entry)
  notify(key)
}

const makeKey = (searchQuery, filter, sort) =>
  JSON.stringify(['search', searchQuery || '', filter, sort])

const fetchPage = async (apolloClient, searchQuery, filter, sort, page) => {
  const search = await withTypesenseClient(apolloClient, (client) =>
    runSearch(client, { searchQuery, filter, sort, page }),
  )
  if (filterToKind(filter) !== 'Document' || search.nodes.length === 0) {
    return search
  }
  return { ...search, nodes: await enrichDocumentNodes(apolloClient, search.nodes) }
}

const useSearchData = ({ apolloClient, searchQuery, filter, sort, skip }) => {
  const key = makeKey(searchQuery, filter, sort)

  const entry = useSyncExternalStore(
    subscribe(key),
    () => cache.get(key),
    () => cache.get(key),
  )

  useEffect(() => {
    if (skip || cache.has(key)) {
      return
    }
    setEntry(key, { search: undefined, loading: true, error: null })
    fetchPage(apolloClient, searchQuery, filter, sort, 1)
      .then((search) => setEntry(key, { search, loading: false, error: null }))
      .catch((error) => setEntry(key, { search: undefined, loading: false, error }))
  }, [key, skip, apolloClient, searchQuery, filter, sort])

  const fetchMore = useCallback(
    async ({ after }) => {
      const page = Number(after)
      const nextSearch = await fetchPage(apolloClient, searchQuery, filter, sort, page)
      const previous = cache.get(key)?.search
      const nodes = [...(previous?.nodes || []), ...nextSearch.nodes]
      setEntry(key, {
        loading: false,
        error: null,
        search: {
          ...previous,
          ...nextSearch,
          totalCount: nextSearch.pageInfo.hasNextPage
            ? nextSearch.totalCount
            : nodes.length,
          nodes,
        },
      })
    },
    [key, apolloClient, searchQuery, filter, sort],
  )

  return {
    search: entry?.search,
    loading: skip ? false : entry?.loading ?? true,
    error: entry?.error,
    fetchMore,
  }
}

export const withAggregations = (Component) => (props) => {
  const apolloClient = useApolloClient()
  const { search, loading, error } = useSearchData({
    apolloClient,
    searchQuery: props.searchQuery || props.urlQuery,
    filter: props.urlFilter,
    sort: props.urlSort,
    skip: false,
  })

  return (
    <Component {...props} dataAggregations={{ search, loading, error }} />
  )
}

export const withResults = (Component) => (props) => {
  const apolloClient = useApolloClient()
  const { search, loading, error, fetchMore } = useSearchData({
    apolloClient,
    searchQuery: props.urlQuery,
    filter: props.urlFilter,
    sort: props.urlSort,
    skip: props.startState,
  })

  return (
    <Component {...props} data={{ search, loading, error }} fetchMore={fetchMore} />
  )
}
