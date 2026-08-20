'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/app/lib/analytics/event-tracking'
import { useSearchUrl } from './use-search-url'
import { useSearchResults } from '../lib/use-search-results'
import {
  DEFAULT_FILTER,
  SUPPORTED_FILTERS,
  isSameFilter,
  findAggregation,
} from '../lib/constants'
import { Form } from './form'
import { Filters } from './filters'
import { Sort } from './sort'
import { Results } from './results'
import { ZeroResults } from './zero-results'
import FeaturedSections from '@/components/Sections/Featured'

const hasResults = (aggregations, filter) =>
  !!findAggregation(aggregations, filter).count

const findFilterWithResults = (aggregations) =>
  SUPPORTED_FILTERS.find((filter) => hasResults(aggregations, filter)) ||
  DEFAULT_FILTER

export function SearchClient() {
  const {
    cleanupUrl,
    urlQuery = '',
    urlFilter,
    urlSort,
    pushSearchParams,
    getSearchParams,
    startState,
  } = useSearchUrl()

  useEffect(() => {
    cleanupUrl()
    // Only on mount, matching the old behaviour -- see withSearchRouter's
    // cleanupUrl, which just normalizes legacy query-string formats once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { search, loading, error, fetchMore } = useSearchResults({
    searchQuery: urlQuery,
    filter: urlFilter,
    sort: urlSort,
    skip: startState,
  })

  const keyword = urlQuery.toLowerCase()
  const category = `${urlFilter.key}:${urlFilter.value}`
  const searchCount = search && search.totalCount

  useEffect(() => {
    if (searchCount !== undefined && !startState) {
      trackEvent(['trackSiteSearch', keyword, category, searchCount])
    }
  }, [startState, keyword, category, searchCount])

  // switch to first tab with results
  useEffect(() => {
    if (loading || !search) {
      return
    }
    const { aggregations } = search
    const currentAgg = findAggregation(aggregations, urlFilter)
    if (currentAgg && currentAgg.count) {
      return
    }
    const newFilter = findFilterWithResults(aggregations)
    if (newFilter && !isSameFilter(newFilter, urlFilter)) {
      pushSearchParams({ filter: newFilter })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, search, urlFilter])

  return (
    <>
      <Form />
      {startState ? (
        <Filters startState urlFilter={urlFilter} />
      ) : (
        <>
          <Filters
            search={search}
            loading={loading}
            error={error}
            urlFilter={urlFilter}
            getSearchParams={getSearchParams}
          />
          {searchCount === 0 ? (
            <ZeroResults />
          ) : (
            <>
              {searchCount > 0 && <Sort />}
              <Results
                search={search}
                loading={loading}
                error={error}
                fetchMore={fetchMore}
              />
            </>
          )}
        </>
      )}
      {!urlQuery && isSameFilter(urlFilter, DEFAULT_FILTER) && <FeaturedSections />}
    </>
  )
}
