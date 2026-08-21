'use client'

import { css } from '@republik/theme/css'

import { SUPPORTED_SORT } from '../lib/constants'
import { SortToggle } from '@/components/SortToggle'
import { useSearchUrl } from './use-search-url'

// No border here -- the old Sort.js never had one either. The line under
// the sort toggles is the first result's own top border (results are
// border-top-only, see document-result.tsx etc.).
const containerStyle = css({ pt: '3px' })

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
