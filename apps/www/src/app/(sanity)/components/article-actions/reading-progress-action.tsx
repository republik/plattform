'use client'

import { useMe } from '@/lib/context/MeContext'
import { css, cx } from '@republik/theme/css'
import { CircleCheck } from 'lucide-react'
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
export function ReadingPositionIcon({ percent }: { percent: number }) {
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

/** The furthest the reader has scrolled on this page, in whole percent. */
function useSessionMaxPercent(enabled: boolean) {
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
        const current = Math.round(readingPercentage(container) * 100)
        setPercent((max) => Math.max(max, current))
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
 * The furthest reading position: the stored maximum, or further if the reader
 * has got beyond it on this visit. The ring, plus the percentage from `md` up;
 * a check once the text has been read. Keeps its own state, so following the
 * scroll doesn't re-render the actions next to it. Members only: everyone else
 * gets the excerpt, which would count as read almost at once.
 */
export function ReadingProgressAction({ stored }: { stored?: number }) {
  const { isMember, hasActiveMembership } = useMe()
  const canTrack = isMember && hasActiveMembership
  const sessionMax = useSessionMaxPercent(canTrack)
  const percent = Math.max(stored ?? 0, sessionMax)

  if (!canTrack) {
    return null
  }

  if (percent >= 100) {
    return (
      <p className={cx(actionStyle, statusStyle)} data-status title='Gelesen'>
        <CircleCheck size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Gelesen</span>
      </p>
    )
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
