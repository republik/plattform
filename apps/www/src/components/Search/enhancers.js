import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { useApolloClient } from '@apollo/client'

import { runWithTypesenseClient } from './typesenseKey'
import { runSearch, filterToDescriptor } from './typesenseAdapter'
import { addOwnDiscussions } from './ownDiscussions'
import * as searchStore from './searchStore'

const makeKey = ({ searchQuery, filter, sort }) =>
  JSON.stringify(['search', searchQuery || '', filter, sort])

const fetchPage = async (apolloClient, request, page) => {
  const { searchQuery, filter, sort } = request
  const search = await runWithTypesenseClient(apolloClient, (client) =>
    runSearch(client, { searchQuery, filter, sort, page }),
  )
  // Comment counts only exist for articles -- which covers both the Document
  // and the Audio tab, since Audio is the hasAudio subset of the same
  // collection and renders through the same DocumentResult.
  if (
    filterToDescriptor(filter).collectionName !== 'articles' ||
    search.nodes.length === 0
  ) {
    return search
  }
  return {
    ...search,
    nodes: await addOwnDiscussions(apolloClient, search.nodes),
  }
}

// The store is a module singleton and never reads from the DOM, so the server
// snapshot is simply "nothing loaded yet".
const getServerSnapshot = () => searchStore.EMPTY_ENTRY

/**
 * The (searchQuery, filter, sort) triple as one value with its store key.
 * Memoised on the key rather than on filter/sort, because withSearchRouter
 * hands down fresh objects every render -- without this, every render would
 * look like a new request.
 */
const useSearchRequest = ({ searchQuery, filter, sort }) => {
  const key = makeKey({ searchQuery, filter, sort })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Object.freeze({ searchQuery, filter, sort, key }), [key])
}

const useSearchData = ({ apolloClient, request, skip }) => {
  const subscribe = useCallback(
    (onStoreChange) => searchStore.subscribe(request.key, onStoreChange),
    [request.key],
  )
  const getSnapshot = useCallback(
    () => searchStore.getSnapshot(request.key),
    [request.key],
  )
  const run = useCallback(
    (r, page) => fetchPage(apolloClient, r, page),
    [apolloClient],
  )

  const entry = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (skip) {
      return
    }
    searchStore.load(request, run)
  }, [request, skip, run])

  const fetchMore = useCallback(
    () => searchStore.loadMore(request, run),
    [request, run],
  )

  return {
    search: entry.search,
    loading: skip ? false : entry.loading,
    error: entry.error,
    fetchMore,
  }
}

// withAggregations and withResults stay two explicit HOCs rather than one
// parameterised factory: everything they share already lives in useSearchData,
// and the three things they differ in (query source, skip, injected prop name)
// are the entire body -- a factory taking all three back as callbacks just
// moves the code without removing it.

export const withAggregations = (Component) => (props) => {
  const request = useSearchRequest({
    searchQuery: props.searchQuery || props.urlQuery,
    filter: props.urlFilter,
    sort: props.urlSort,
  })
  const { search, loading, error } = useSearchData({
    apolloClient: useApolloClient(),
    request,
    skip: false,
  })

  return <Component {...props} dataAggregations={{ search, loading, error }} />
}

export const withResults = (Component) => (props) => {
  const request = useSearchRequest({
    searchQuery: props.urlQuery,
    filter: props.urlFilter,
    sort: props.urlSort,
  })
  const { search, loading, error, fetchMore } = useSearchData({
    apolloClient: useApolloClient(),
    request,
    skip: props.startState,
  })

  return (
    <Component
      {...props}
      data={{ search, loading, error }}
      fetchMore={fetchMore}
    />
  )
}
