import { useEffect } from 'react'
import compose from 'lodash/flowRight'

import Form from './Form'
import Filters from './Filters'
import Sort from './Sort'
import Results from './Results'

import { Center } from '@project-r/styleguide'

import withSearchRouter from './withSearchRouter'
import { useSearchResults } from './useSearchResults'
import ZeroResults from './ZeroResults'

import { trackEvent } from '@/app/lib/analytics/event-tracking'

import {
  DEFAULT_FILTER,
  SUPPORTED_FILTERS,
  isSameFilter,
  findAggregation,
} from './constants'

const hasResults = (aggregations, filter) =>
  !!findAggregation(aggregations, filter).count

const findFilterWithResults = (aggregations) =>
  SUPPORTED_FILTERS.find((filter) => hasResults(aggregations, filter)) ||
  DEFAULT_FILTER

export default compose(withSearchRouter)(
  ({
    cleanupUrl,
    urlQuery = '',
    urlFilter,
    urlSort,
    pushSearchParams,
    startState,
  }) => {
    useEffect(() => {
      cleanupUrl()
    }, [])

    // Fetched once here and passed down to Filters/Results as props --
    // both need the exact same (searchQuery, filter, sort) result.
    const { search, loading, error, fetchMore } = useSearchResults({
      searchQuery: urlQuery,
      filter: urlFilter,
      sort: urlSort,
      skip: startState,
    })

    // calc outside of effect to ensure it only runs when changing
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
    }, [loading, search, urlFilter])

    return (
      <Center style={{ padding: 0 }}>
        <Form />
        {startState ? (
          <Filters startState />
        ) : (
          <>
            <Filters search={search} loading={loading} error={error} />
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
      </Center>
    )
  },
)
