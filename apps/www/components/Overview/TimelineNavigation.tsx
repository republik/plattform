import React, { useEffect, useRef } from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import {
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { getMonthName } from './yearDataUtils'

interface TimelineNavigationProps {
  year: number
  currentMonth: number // 1-12
  monthsWithContent: number[] // Array of months (1-12) that have teasers
  minYear?: number
  maxYear?: number
}

const styles = {
  container: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 40,
    marginTop: 20,
  }),
  timeline: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    gap: 24,
    padding: '0 15px 4px 0',
    WebkitOverflowScrolling: 'touch',
  }),
  timelineItem: css({
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    paddingLeft: '15px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }),
  timelineItemActive: css({
    ...fontStyles.sansSerifMedium26,
  }),
  timelineItemInactive: css({
    ...fontStyles.sansSerifRegular16,
  }),
}

const TimelineNavigation: React.FC<TimelineNavigationProps> = ({
  year,
  currentMonth,
  monthsWithContent,
  minYear = 2018,
  maxYear = new Date().getFullYear(),
}) => {
  const [colorScheme] = useColorContext()
  const timelineRef = useRef<HTMLDivElement>(null)
  const yearTimelineRef = useRef<HTMLDivElement>(null)

  // Scroll current month into view
  useEffect(() => {
    if (timelineRef.current) {
      const activeMonth = timelineRef.current.querySelector(
        `[data-month="${currentMonth}"]`,
      )
      if (activeMonth) {
        activeMonth.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [currentMonth])

  // Scroll current year into view
  useEffect(() => {
    if (yearTimelineRef.current) {
      const activeYear = yearTimelineRef.current.querySelector(
        `[data-year="${year}"]`,
      )
      if (activeYear) {
        activeYear.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [year])

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  )

  return (
    <div {...styles.container}>
      {/* Year Timeline */}
      <div {...styles.timeline} ref={yearTimelineRef}>
        {years.map((y) => {
          const isActive = y === year
          const yearLinkStyle = {
            ...styles.timelineItem,
            ...(isActive ? styles.timelineItemActive : styles.timelineItemInactive),
            ...colorScheme.set('color', isActive ? 'text' : 'textSoft'),
          }

          return (
            <Link
              key={y}
              href={`/archiv/${y}/1`}
              {...yearLinkStyle}
              data-year={y}
              aria-current={isActive ? 'page' : undefined}
            >
              {y}
            </Link>
          )
        })}
      </div>

      {/* Month Timeline */}
      <div {...styles.timeline} ref={timelineRef}>
        {months.map((month) => {
          const hasContent = monthsWithContent.includes(month)
          const isActive = month === currentMonth
          const isEmpty = !hasContent

          const monthLinkStyle = {
            ...styles.timelineItem,
            ...(isActive ? styles.timelineItemActive : styles.timelineItemInactive),
            ...colorScheme.set('color', isActive ? 'text' : 'textSoft'),
          }

          return (
            <Link
              key={month}
              href={`/archiv/${year}/${month}`}
              {...monthLinkStyle}
              data-month={month}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={isEmpty}
            >
              {getMonthName(month)}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default TimelineNavigation
