import { useMemo } from 'react'
import { withAggregations } from './enhancers'
import compose from 'lodash/flowRight'
import withSearchRouter from './withSearchRouter'
import {
  LATEST_SORT,
  SUPPORTED_FILTERS,
  isSameFilter,
  findAggregation,
} from './constants'
import { css } from 'glamor'
import {
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'

import { countFormat } from '../../lib/utils/format'
import Link from 'next/link'

const styles = {
  list: css({
    listStyle: 'none',
    padding: '0 0 40px',
    margin: 0,
  }),
  listItem: css({
    display: 'inline-block',
    marginRight: 25,
    ...fontStyles.sansSerifRegular16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
      marginRight: 40,
    },
  }),
  linkRegular: css({
    textDecoration: 'none',
  }),
  linkSelected: css({
    textDecoration: 'underline',
  }),
}

const Filters = compose(
  withSearchRouter,
  withAggregations,
)(({ dataAggregations, urlFilter, getSearchParams, startState }) => {
  const { search, loading, error } = dataAggregations
  const [colorScheme] = useColorContext()
  const hoverRule = useMemo(() => {
    return css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('textSoft'),
        },
      },
    })
  }, [colorScheme])

  if (loading || error || !search?.aggregations) return null

  const { aggregations } = search

  return (
    <ul {...styles.list}>
      {SUPPORTED_FILTERS.map((filter, key) => {
        const agg = findAggregation(aggregations, filter)
        if (!agg) {
          return null
        }

        const text = (
          <>
            {agg.label} <small>{countFormat(agg.count)}</small>
          </>
        )

        const isSame = isSameFilter(filter, urlFilter)
        const isActive = !startState && isSame

        return (
          <li key={key} {...styles.listItem}>
            {agg.count ? (
              <Link
                href={{
                  pathname: '/suche',
                  query: getSearchParams({
                    filter,
                    sort: startState ? LATEST_SORT : undefined,
                  }),
                }}
                passHref
                {...colorScheme.set('color', 'text')}
                {...styles[isActive ? 'linkSelected' : 'linkRegular']}
                {...(!isActive && hoverRule)}
              >
                {text}
              </Link>
            ) : (
              text
            )}
          </li>
        )
      })}
    </ul>
  )
})

export default Filters
