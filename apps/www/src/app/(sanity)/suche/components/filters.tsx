'use client'

import Link from 'next/link'
import { css, cx } from '@republik/theme/css'

import {
  SUPPORTED_FILTERS,
  LATEST_SORT,
  isSameFilter,
  findAggregation,
  filterLabelKey,
} from '../lib/constants'
import { useTranslation } from '@/lib/withT'
import { countFormat } from '@/lib/utils/format'

const listStyle = css({ listStyle: 'none', p: 0, pb: 10, m: 0 })
const listItemStyle = css({
  display: 'inline-block',
  mr: 6,
  fontSize: 14,
  md: { fontSize: 16, mr: 10 },
})
const linkRegularStyle = css({
  color: 'text',
  textDecoration: 'none',
  '&:hover': { color: 'textSoft' },
})
const linkSelectedStyle = css({ color: 'text', textDecoration: 'underline' })

export function Filters({
  search,
  loading,
  error,
  urlFilter,
  getSearchParams,
  startState,
}: {
  search?: any
  loading?: boolean
  error?: unknown
  urlFilter: { key: string; value: string }
  getSearchParams?: (params: any) => Record<string, string>
  startState?: boolean
}) {
  const { t } = useTranslation()

  if (loading || error || !search?.aggregations) return null

  const { aggregations } = search

  return (
    <ul className={listStyle}>
      {SUPPORTED_FILTERS.map((filter, key) => {
        const agg = findAggregation(aggregations, filter)
        if (!agg) {
          return null
        }

        const isSame = isSameFilter(filter, urlFilter)
        const isActive = !startState && isSame

        const text = (
          <>
            {t(filterLabelKey(filter))} <small>{countFormat(agg.count)}</small>
          </>
        )

        return (
          <li key={key} className={listItemStyle}>
            {agg.count ? (
              <Link
                href={{
                  pathname: '/suche',
                  query: getSearchParams({
                    filter,
                    sort: startState ? LATEST_SORT : undefined,
                  }),
                }}
                className={cx(isActive ? linkSelectedStyle : linkRegularStyle)}
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
}
