import React, { useEffect } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'

import Form from './Form'
import Filters from './Filters'
import Sort from './Sort'
import Results from './Results'
import CheatSheet from './CheatSheet'

import { Center, mediaQueries } from '@project-r/styleguide'

import withSearchRouter from './withSearchRouter'
import { withResults, withAggregations } from './enhancers'
import ZeroResults from './ZeroResults'

import track from '../../lib/matomo'

import {
  DEFAULT_FILTER,
  SUPPORTED_FILTERS,
  isSameFilter,
  findAggregation,
} from './constants'

const styles = {
  container: css({
    paddingRight: 15,
    paddingLeft: 15,
    [mediaQueries.mUp]: {
      paddingRight: 0,
      paddingLeft: 0,
    },
  }),
}

const hasResults = (aggregations, filter) =>
  !!findAggregation(aggregations, filter).count

const findFilterWithResults = (aggregations) =>
  SUPPORTED_FILTERS.find((filter) => hasResults(aggregations, filter)) ||
  DEFAULT_FILTER

export default compose(
  withSearchRouter,
  withAggregations,
  withResults,
)(
  ({
    cleanupUrl,
    urlQuery = '',
    urlFilter,
    pushSearchParams,
    startState,
    data: { search } = {},
    dataAggregations,
  }) => {
    useEffect(() => {
      cleanupUrl()
    }, [])

    // calc outside of effect to ensure it only runs when changing
    const keyword = urlQuery.toLowerCase()
    const category = `${urlFilter.key}:${urlFilter.value}`
    const searchCount = search && search.totalCount
    const aggCount =
      dataAggregations &&
      dataAggregations.search &&
      dataAggregations.search.totalCount

    useEffect(() => {
      if (searchCount !== undefined && !startState) {
        track(['trackSiteSearch', keyword, category, searchCount])
      }
    }, [startState, keyword, category, searchCount])

    // switch to first tab with results
    useEffect(() => {
      if (!dataAggregations || dataAggregations.loading) {
        return
      }
      const { aggregations } = dataAggregations.search
      const currentAgg = findAggregation(aggregations, urlFilter)
      if (currentAgg && currentAgg.count) {
        return
      }
      const newFilter = findFilterWithResults(aggregations)
      if (newFilter && !isSameFilter(newFilter, urlFilter)) {
        pushSearchParams({ filter: newFilter })
      }
    }, [dataAggregations, urlFilter])

    return (
      <Center {...styles.container} style={{ padding: 15, marginTop: 0 }}>
        <Form />
        {startState ? (
          <>
            <Filters startState />
            <CheatSheet />
          </>
        ) : (
          <>
            <Filters />
            {searchCount === 0 && aggCount === 0 ? (
              <ZeroResults />
            ) : (
              <>
                {searchCount > 0 && <Sort />}
                <Results />
              </>
            )}
          </>
        )}
      </Center>
    )
  },
)
