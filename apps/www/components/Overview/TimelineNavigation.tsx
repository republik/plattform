import React, { useEffect, useRef } from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import { useColorContext, fontStyles, mediaQueries } from '@project-r/styleguide'
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
    marginBottom: 40,
    marginTop: 20,
  }),
  monthTimeline: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    gap: 24,
    padding: '10px 15px',
    WebkitOverflowScrolling: 'touch',
    [mediaQueries.mUp]: {
      justifyContent: 'center',
    },
  }),
  monthItem: css({
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    minWidth: 48,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }),
  monthLinkActive: css({
    ...fontStyles.sansSerifMedium32,
  }),
  monthLinkInactive: css({
    ...fontStyles.sansSerifMedium16,
    opacity: 0.9,
  }),

  yearTimeline: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    padding: '0 15px',
    [mediaQueries.mUp]: {
      justifyContent: 'center',
    },
  }),
  yearLink: css({
    flex: '0 0 auto',
    padding: '8px 16px',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }),
  yearLinkInactive: css({
    ...fontStyles.sansSerifMedium16,
    opacity: 0.9,
  }),
  yearLinkActive: css({
    ...fontStyles.sansSerifMedium40,
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
      <div {...styles.yearTimeline} ref={yearTimelineRef}>
        {years.map((y) => {
          const isActive = y === year
          const yearLinkStyle = {
            ...styles.yearLink,
            ...(isActive ? styles.yearLinkActive : styles.yearLinkInactive),
          }

          return (
            <Link key={y} href={`/${y}/1`} passHref legacyBehavior>
              <a
                {...yearLinkStyle}
                {...colorScheme.set('color', 'text')}
                data-year={y}
                aria-current={isActive ? 'page' : undefined}
              >
                {y}
              </a>
            </Link>
          )
        })}
      </div>

      {/* Month Timeline */}
      <div {...styles.monthTimeline} ref={timelineRef}>
        {months.map((month) => {
          const hasContent = monthsWithContent.includes(month)
          const isActive = month === currentMonth
          const isEmpty = !hasContent

          const monthLinkStyle = {
            ...styles.monthItem,
            ...(isActive ? styles.monthLinkActive : styles.monthLinkInactive),
          }

          return (
            <Link
              key={month}
              href={`/${year}/${month}`}
              {...monthLinkStyle}
              {...colorScheme.set('color', 'text')}
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
