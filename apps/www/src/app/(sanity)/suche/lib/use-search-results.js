import { useCallback, useEffect, useRef, useState } from 'react'
import { useApolloClient } from '@apollo/client'

import { reportError } from '@/lib/errors/reportError'
import { runWithTypesenseClient } from './typesense-key'
import { runSearch } from './typesense-adapter'

const fetchPage = (apolloClient, { searchQuery, filter, sort }, page) =>
  runWithTypesenseClient(apolloClient, (client) =>
    runSearch(client, { searchQuery, filter, sort, page }),
  )

/**
 * Fetches page 1 of a search whenever (searchQuery, filter, sort) changes,
 * and exposes fetchMore to append subsequent pages.
 *
 * Deliberately simple: each call is its own independent fetch, with no
 * cross-component cache or request dedup. Multiple callers with the same
 * params each fire their own request -- callers that need to share one
 * result (see index.js) fetch once and pass it down as props instead.
 */
export const useSearchResults = ({ searchQuery, filter, sort, skip }) => {
  const apolloClient = useApolloClient()
  const [state, setState] = useState({
    search: undefined,
    loading: !skip,
    error: null,
  })
  const pageRef = useRef(0)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    if (skip) {
      pageRef.current = 0
      setState({ search: undefined, loading: false, error: null })
      return
    }

    let cancelled = false
    pageRef.current = 0
    setState({ search: undefined, loading: true, error: null })

    fetchPage(apolloClient, { searchQuery, filter, sort }, 1).then(
      (search) => {
        if (cancelled) return
        pageRef.current = 1
        setState({ search, loading: false, error: null })
      },
      (error) => {
        if (cancelled) return
        setState({ search: undefined, loading: false, error })
      },
    )

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    apolloClient,
    searchQuery,
    filter?.key,
    filter?.value,
    sort?.key,
    sort?.direction,
    skip,
  ])

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !state.search?.pageInfo?.hasNextPage) {
      return
    }
    loadingMoreRef.current = true
    const page = pageRef.current + 1
    try {
      const next = await fetchPage(apolloClient, { searchQuery, filter, sort }, page)
      pageRef.current = page
      setState((current) => ({
        ...current,
        search: {
          ...current.search,
          ...next,
          nodes: [...current.search.nodes, ...next.nodes],
        },
      }))
    } catch (error) {
      reportError('search/loadMore', error)
    } finally {
      loadingMoreRef.current = false
    }
  }, [apolloClient, searchQuery, filter, sort, state.search])

  return { ...state, fetchMore }
}
