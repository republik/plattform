'use client'

import Link from 'next/link'
import { css } from '@republik/theme/css'

import { useTranslation } from '@/lib/withT'
import { countFormat } from '@/lib/utils/format'

const textStyle = css({ mb: 4 })
const linkStyle = css({ color: 'primary', '&:hover': { color: 'primaryHover' } })
const softStyle = css({ color: 'textSoft' })

/** Live result count shown under the search field while the typed value
 * diverges from the committed URL query (see form.tsx). */
export function LiveState({
  formValue,
  searchQuery,
  dataAggregations,
  getSearchParams,
  onClickSearchResults,
}) {
  const { t } = useTranslation()
  // Overall count across all tabs -- "type" already sums Document+User+Comment
  // without double-counting Audio, which is a subset of Document.
  const totalCount = dataAggregations.search?.aggregations?.find(
    (aggregation) => aggregation.key === 'type',
  )?.count
  const results = t.pluralize('search/pageInfo/total', {
    count: countFormat(totalCount),
  })

  if (formValue !== searchQuery || dataAggregations.loading) {
    return <p className={textStyle}>&nbsp;</p>
  }

  return (
    <p className={textStyle}>
      {totalCount ? (
        <Link
          href={{ pathname: '/suche', query: getSearchParams({ q: searchQuery }) }}
          className={linkStyle}
          onClick={() => onClickSearchResults?.()}
        >
          {results}
        </Link>
      ) : (
        <span className={softStyle}>{results}</span>
      )}
    </p>
  )
}
