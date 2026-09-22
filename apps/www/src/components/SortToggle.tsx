import Link from 'next/link'
import { css, cx } from '@republik/theme/css'
import { IconKeyboardArrowDown, IconKeyboardArrowUp } from '@republik/icons'

import { useTranslation } from '@/lib/withT'

const linkStyle = css({ fontSize: 14, mr: 4, md: { fontSize: 16, mr: 8 } })
const linkRegularStyle = css({
  textDecoration: 'none',
  '&:hover': { color: 'textSoft' },
})
const linkSelectedStyle = css({ textDecoration: 'underline' })
const iconStyle = css({
  display: 'inline-block',
  lineHeight: 0,
  verticalAlign: 'text-bottom',
})

const SORT_DIRECTION_ICONS = {
  ASC: IconKeyboardArrowDown,
  DESC: IconKeyboardArrowUp,
}

const getDefaultDirection = (sort) => sort.directions && sort.directions[0]

const getNextDirection = (sort, directions) => {
  const index = directions.indexOf(sort.direction)
  return index === directions.length - 1 ? directions[0] : directions[index + 1]
}

/**
 * A single sort-order link (e.g. "Relevanz"/"Datum") that toggles its
 * direction on repeat clicks -- generic, not search-specific, despite the
 * `search/sort/*` i18n key prefix both current callers happen to share
 * (apps/www/src/app/(sanity)/suche/components/sort.tsx and
 * apps/www/src/components/Questionnaire/Submissions/legacy/index.js).
 */
export function SortToggle({ sort, urlSort, getSearchParams, pathname }) {
  const { t } = useTranslation()
  const selected = urlSort.key === sort.key
  const label = t(`search/sort/${sort.key}`)
  const direction = selected ? urlSort.direction : getDefaultDirection(sort)
  const Icon = direction && SORT_DIRECTION_ICONS[direction]

  return (
    <Link
      href={{
        pathname,
        query: getSearchParams({
          sort: {
            key: sort.key,
            direction:
              selected && direction
                ? getNextDirection(urlSort, sort.directions)
                : direction,
          },
        }),
      }}
      className={cx(linkStyle, selected ? linkSelectedStyle : linkRegularStyle)}
    >
      <span>
        {label}
        {Icon && (
          <span
            className={iconStyle}
            style={{ opacity: selected ? 1 : 0 }}
            role='button'
            title={t(`search/sort/${direction}/aria`)}
          >
            <Icon />
          </span>
        )}
      </span>
    </Link>
  )
}
