'use client'

import { css } from '@republik/theme/css'

import { SUPPORTED_SORT } from '../lib/constants'
import { SortToggle } from '@/components/SortToggle'
import { useSearchUrl } from './use-search-url'

const containerStyle = css({
  pt: '3px',
  pb: 4,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'divider',
})

export function Sort() {
  const { urlQuery, urlSort, getSearchParams, pathname } = useSearchUrl()

  return (
    <div className={containerStyle}>
      {SUPPORTED_SORT.filter((sort) => urlQuery || !sort.needsQuery).map(
        (sort, key) => (
          <SortToggle
            key={key}
            sort={sort}
            urlSort={urlSort}
            getSearchParams={getSearchParams}
            pathname={pathname}
          />
        ),
      )}
    </div>
  )
}
