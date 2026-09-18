'use client'

import { MIN_YEAR, getMonthName } from '@/app/(sanity)/archiv/lib/month-range'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const timelineStyle = css({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'baseline',
  gap: '6',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  pb: '1',
  WebkitOverflowScrolling: 'touch',
})

const itemStyle = css({
  flex: '0 0 auto',
  scrollSnapAlign: 'start',
  textAlign: 'center',
  transition: 'transform 0.2s',
  _hover: { transform: 'translateY(-2px)' },
})

const activeStyle = css({
  textStyle: 'sansSerifMedium',
  fontSize: 'xl',
  color: 'text',
})
const inactiveStyle = css({
  textStyle: 'sansSerifRegular',
  fontSize: 'base',
  color: 'textSoft',
})

function useScrollIntoView(selector: string) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const active = ref.current?.querySelector(selector)
    active?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [selector])

  return ref
}

export function ArchiveTimelineNavigation({
  year,
  month,
  monthsWithContent,
}: {
  year: number
  month: number
  monthsWithContent: number[]
}) {
  const yearsRef = useScrollIntoView(`[data-year="${year}"]`)
  const monthsRef = useScrollIntoView(`[data-month="${month}"]`)

  const now = new Date()
  const maxYear = now.getFullYear()

  // Past years run to December; the current year stops at the current month —
  // but never hides the month being viewed or one that has content, since
  // articles can carry a future publish date.
  const maxMonth =
    year === maxYear
      ? Math.max(now.getMonth() + 1, month, ...monthsWithContent)
      : 12

  const years = Array.from(
    { length: maxYear - MIN_YEAR + 1 },
    (_, i) => MIN_YEAR + i,
  )
  const months = Array.from({ length: maxMonth }, (_, i) => i + 1)

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        mt: '5',
        mb: '10',
      })}
    >
      <div className={timelineStyle} ref={yearsRef}>
        {years.map((y) => (
          <Link
            key={y}
            href={`/archiv/${y}/1`}
            className={cx(itemStyle, y === year ? activeStyle : inactiveStyle)}
            data-year={y}
            aria-current={y === year ? 'page' : undefined}
          >
            {y}
          </Link>
        ))}
      </div>

      <div className={timelineStyle} ref={monthsRef}>
        {months.map((m) => (
          <Link
            key={m}
            href={`/archiv/${year}/${m}`}
            className={cx(itemStyle, m === month ? activeStyle : inactiveStyle)}
            data-month={m}
            aria-current={m === month ? 'page' : undefined}
            // Advisory only: empty months stay reachable and say so.
            aria-disabled={!monthsWithContent.includes(m)}
          >
            {getMonthName(m)}
          </Link>
        ))}
      </div>
    </div>
  )
}
