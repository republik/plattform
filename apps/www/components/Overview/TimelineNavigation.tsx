import React, { useEffect, useRef } from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import { useColorContext } from '@project-r/styleguide'
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
  yearSelector: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 15,
  }),
  yearButton: css({
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.7,
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
  }),
  currentYear: css({
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
  }),
  timeline: css({
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    gap: 8,
    padding: '10px 0',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    '::-webkit-scrollbar': {
      height: 6,
    },
    '::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
    },
  }),
  monthItem: css({
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    minWidth: 100,
    padding: '12px 16px',
    textAlign: 'center',
    borderRadius: 4,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }),
  monthActive: css({
    fontWeight: 'bold',
    border: '1px solid currentColor',
  }),
  monthEmpty: css({
    opacity: 0.4,
    cursor: 'default',
    pointerEvents: 'none',
  }),
  monthName: css({
    fontSize: 14,
    marginBottom: 4,
  }),
  monthCount: css({
    fontSize: 11,
    opacity: 0.8,
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

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div {...styles.container}>
      {/* Year Selector */}
      <div {...styles.yearSelector} {...colorScheme.set('color', 'text')}>
        <Link href={`/${year - 1}/1`} passHref legacyBehavior>
          <button
            {...styles.yearButton}
            disabled={year <= minYear}
            {...colorScheme.set('color', 'text')}
          >
            ←
          </button>
        </Link>
        <div {...styles.currentYear}>{year}</div>
        <Link href={`/${year + 1}/1`} passHref legacyBehavior>
          <button
            {...styles.yearButton}
            disabled={year >= maxYear}
            {...colorScheme.set('color', 'text')}
          >
            →
          </button>
        </Link>
      </div>

      {/* Month Timeline */}
      <div {...styles.timeline} ref={timelineRef}>
        {months.map((month) => {
          const hasContent = monthsWithContent.includes(month)
          const isActive = month === currentMonth
          const isEmpty = !hasContent

          const monthStyle = {
            ...styles.monthItem,
            ...(isActive ? styles.monthActive : {}),
            ...(isEmpty ? styles.monthEmpty : {}),
          }

          return (
            <Link
              key={month}
              href={`/${year}/${month}`}
              passHref
              legacyBehavior
            >
              <a
                {...monthStyle}
                {...colorScheme.set('color', 'text')}
                {...colorScheme.set('backgroundColor', 'hover')}
                data-month={month}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={isEmpty}
              >
                <div {...styles.monthName}>{getMonthName(month)}</div>
                {hasContent && (
                  <div {...styles.monthCount}>
                    {isEmpty ? '—' : '●'}
                  </div>
                )}
              </a>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default TimelineNavigation
