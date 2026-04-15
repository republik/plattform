import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import { DEFAULT_FILTER, DEFAULT_SORT, isSameFilter } from './constants'

const isDefaultFilter = (filter) => isSameFilter(filter, DEFAULT_FILTER)

const QUERY_PARAM = 'q'
const FILTER_KEY_PARAM = 'fkey'
const FILTER_VALUE_PARAM = 'fvalue'
const SORT_KEY_PARAM = 'skey'
const SORT_DIRECTION_PARAM = 'sdir'

const WrapperRouter = (WrappedComponent) =>
  compose(withRouter)(({ router, ...props }) => {
    const { query, pathname } = router
    const urlQuery = query[QUERY_PARAM]
    const urlFilter = {
      key: query[FILTER_KEY_PARAM] || DEFAULT_FILTER.key,
      value: query[FILTER_VALUE_PARAM] || DEFAULT_FILTER.value,
    }
    const urlSort = {
      key: query[SORT_KEY_PARAM] || DEFAULT_SORT.key,
      direction: query[SORT_DIRECTION_PARAM],
    }
    const shouldShallowRoute = pathname === '/suche'

    const pushRoute = (newParams) => {
      return router.push({ pathname: '/suche', query: newParams }, undefined, {
        shallow: shouldShallowRoute,
      })
    }

    const getSearchParams = ({ filter, sort, q }) => {
      const query = {}
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

    const pushSearchParams = (params) => {
      return pushRoute(getSearchParams(params))
    }

    const getCleanQuery = (newQuery = {}) => {
      const baseQuery = {
        ...query,
        ...newQuery,
      }
      const cleanQuery = {}

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
      ].filter(Boolean)
      transferKeys.forEach((key) => {
        // prevent empty keys (leading to an tailing ? in the url)
        if (baseQuery[key]) {
          cleanQuery[key] = baseQuery[key]
        }
      })
      return cleanQuery
    }

    const cleanupUrl = () => {
      router.replace(
        { pathname: '/suche', query: getCleanQuery() },
        undefined,
        { shallow: shouldShallowRoute },
      )
    }

    return (
      <WrappedComponent
        startState={
          !urlQuery &&
          isDefaultFilter(urlFilter) &&
          DEFAULT_SORT.key === urlSort.key
        }
        urlQuery={urlQuery}
        urlFilter={urlFilter}
        urlSort={urlSort}
        pushSearchParams={pushSearchParams}
        getSearchParams={getSearchParams}
        cleanupUrl={cleanupUrl}
        {...props}
      />
    )
  })

export default WrapperRouter
