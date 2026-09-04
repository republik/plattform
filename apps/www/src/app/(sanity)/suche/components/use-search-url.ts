'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { DEFAULT_FILTER, DEFAULT_SORT, isSameFilter } from '../lib/constants'

const isDefaultFilter = (filter) => isSameFilter(filter, DEFAULT_FILTER)

const QUERY_PARAM = 'q'
const FILTER_KEY_PARAM = 'fkey'
const FILTER_VALUE_PARAM = 'fvalue'
const SORT_KEY_PARAM = 'skey'
const SORT_DIRECTION_PARAM = 'sdir'

// App Router replacement for withSearchRouter.js, same public shape, built
// on next/navigation -- no `shallow` concept needed here.
export function useSearchUrl() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get(QUERY_PARAM) || undefined
  const urlFilter = {
    key: searchParams.get(FILTER_KEY_PARAM) || DEFAULT_FILTER.key,
    value: searchParams.get(FILTER_VALUE_PARAM) || DEFAULT_FILTER.value,
  }
  const urlSort = {
    key: searchParams.get(SORT_KEY_PARAM) || DEFAULT_SORT.key,
    direction: searchParams.get(SORT_DIRECTION_PARAM) || undefined,
  }

  const getCleanQuery = (newQuery: Record<string, string> = {}) => {
    const baseQuery: Record<string, string> = {
      ...Object.fromEntries(searchParams.entries()),
      ...newQuery,
    }
    const cleanQuery: Record<string, string> = {}

    // support old query strings
    if (baseQuery.filters) {
      const filters = decodeURIComponent(baseQuery.filters).split(':')
      if (filters.length > 1) {
        cleanQuery[FILTER_KEY_PARAM] = filters[0]
        cleanQuery[FILTER_VALUE_PARAM] = filters[1]
      }
    }
    if (baseQuery.sort) {
      const sort = decodeURIComponent(baseQuery.sort).split(':')
      if (sort.length > 1) {
        cleanQuery[SORT_KEY_PARAM] = sort[0]
        cleanQuery[SORT_DIRECTION_PARAM] = sort[1]
      }
    }

    const defaultFilter = isDefaultFilter({
      key: baseQuery[FILTER_KEY_PARAM],
      value: baseQuery[FILTER_VALUE_PARAM],
    })
    const defaultSort = DEFAULT_SORT.key === baseQuery[SORT_KEY_PARAM]

    const transferKeys = [
      QUERY_PARAM,
      !defaultFilter && FILTER_KEY_PARAM,
      !defaultFilter && FILTER_VALUE_PARAM,
      !defaultSort && SORT_KEY_PARAM,
      !defaultSort && SORT_DIRECTION_PARAM,
    ].filter(Boolean) as string[]
    transferKeys.forEach((key) => {
      // prevent empty keys (leading to a trailing ? in the url)
      if (baseQuery[key]) {
        cleanQuery[key] = baseQuery[key]
      }
    })
    return cleanQuery
  }

  const getSearchParams = ({ filter, sort, q }: { filter?: any; sort?: any; q?: string } = {}) => {
    const query: Record<string, string> = {}
    if (filter) {
      query[FILTER_KEY_PARAM] = filter.key
      query[FILTER_VALUE_PARAM] = filter.value
    }
    if (sort) {
      query[SORT_KEY_PARAM] = sort.key
      query[SORT_DIRECTION_PARAM] = sort.direction
    }
    if (q) {
      query[QUERY_PARAM] = q
    }
    return getCleanQuery(query)
  }

  const toUrl = (query: Record<string, string>) => {
    const qs = new URLSearchParams(query).toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const pushSearchParams = (params) => router.push(toUrl(getSearchParams(params)))

  const cleanupUrl = () => router.replace(toUrl(getCleanQuery()))

  return {
    startState:
      !urlQuery &&
      isDefaultFilter(urlFilter) &&
      DEFAULT_SORT.key === urlSort.key,
    urlQuery,
    urlFilter,
    urlSort,
    pathname,
    getSearchParams,
    pushSearchParams,
    cleanupUrl,
  }
}
