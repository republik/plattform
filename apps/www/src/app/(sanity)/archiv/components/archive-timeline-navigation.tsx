'use client'

import {
  MIN_YEAR,
  currentZurichMonth,
  getMonthName,
  parseArchiveParams,
} from '@/app/(sanity)/archiv/lib/month-range'
import Link from '@/app/components/ui/link'
import { css, cx } from '@republik/theme/css'
import { useParams } from 'next/navigation'
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
    ref.current?.querySelector(selector)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [selector])

  return ref
}

// Lives in the archive layout, so it stays mounted while a month loads.
export function ArchiveTimelineNavigation() {
  const selected = parseArchiveParams(useParams())
  const yearsRef = useScrollIntoView(`[data-year="${selected?.year}"]`)
  const monthsRef = useScrollIntoView(`[data-month="${selected?.month}"]`)

  if (!selected) return null
  const { year, month } = selected

  const now = currentZurichMonth()
  const years = Array.from(
    { length: now.year - MIN_YEAR + 1 },
    (_, i) => MIN_YEAR + i,
  )
  const months = Array.from(
    { length: year === now.year ? now.month : 12 },
    (_, i) => i + 1,
  )

  return (
    <nav
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
          >
            {getMonthName(m)}
          </Link>
        ))}
      </div>
    </nav>
  )
}
