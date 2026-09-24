'use client'

import { useMe } from '@/lib/context/MeContext'
import { css, cx } from '@republik/theme/css'
import { useEffect, useState } from 'react'
import { ACTION_ICON_SIZE, actionLabelStyle, actionStyle } from './action-style'
import { readingContainer, readingPercentage } from './reading-region'

const trackStyle = css({
  opacity: 0.35,
})

const arcStyle = css({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  transform: 'rotate(-90deg)',
  transition: 'stroke-dashoffset 0.35s',
})

// A status, not an action. Keyed on an attribute to outrank `actionStyle`'s
// cursor and hover: `cx` doesn't resolve conflicting atomic classes.
const statusStyle = css({
  '&[data-status]': {
    cursor: 'default',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
    _hover: { color: 'text' },
  },
})

/**
 * Percentage ring, adapted from the legacy `ProgressCircle`
 * (`packages/styleguide/src/components/Progress/Circle.tsx`): a faint track
 * behind a `currentColor` arc that fills clockwise from 12 o'clock.
 */
function ReadingPositionIcon({ percent }: { percent: number }) {
  const r = 10
  const circumference = 2 * Math.PI * r
  const clamped = Math.min(Math.max(percent, 0), 100)

  return (
    <svg
      width={ACTION_ICON_SIZE}
      height={ACTION_ICON_SIZE}
      viewBox='0 0 24 24'
      fill='none'
    >
      <circle
        className={trackStyle}
        cx='12'
        cy='12'
        r={r}
        stroke='currentColor'
        strokeWidth={2}
      />
      <circle
        className={arcStyle}
        cx='12'
        cy='12'
        r={r}
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (clamped / 100) * circumference}
      />
    </svg>
  )
}

function useLiveReadingPercent(enabled: boolean) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let frame: number | undefined
    const measure = () => {
      frame = undefined
      const container = readingContainer()
      if (container) {
        setPercent(Math.round(readingPercentage(container) * 100))
      }
    }
    const onScroll = () => {
      frame ??= requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== undefined) {
        cancelAnimationFrame(frame)
      }
    }
  }, [enabled])

  return percent
}

/**
 * Live reading position: the ring, plus the percentage from `md` up. Keeps its
 * own state, so following the scroll doesn't re-render the actions next to it.
 * Members only: everyone else gets the excerpt, which would count as read
 * almost at once.
 */
export function ReadingProgressAction() {
  const { isMember, hasActiveMembership } = useMe()
  const canTrack = isMember && hasActiveMembership
  const percent = useLiveReadingPercent(canTrack)

  if (!canTrack) {
    return null
  }

  return (
    <p
      className={cx(actionStyle, statusStyle)}
      data-status
      title={`${percent}% gelesen`}
    >
      <ReadingPositionIcon percent={percent} />
      <span className={actionLabelStyle}>{percent}%</span>
    </p>
  )
}
