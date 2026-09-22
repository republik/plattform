'use client'

import { useAudioContext } from '@/components/Audio/AudioProvider'
import { useMe } from '@/lib/context/MeContext'
import { useQuery } from '@apollo/client'
import { UserDocumentProgressDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { css, cx } from '@republik/theme/css'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { ACTION_ICON_SIZE, actionStyle, pillStyle } from './action-style'
import { readingRegion, scrollPaddingTop } from './reading-region'

/** Tolerance for "at the very top", to survive sub-pixel scroll offsets. */
const AT_TOP_THRESHOLD = 4

const trackStyle = css({
  color: 'divider',
})

const arcStyle = css({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  transform: 'rotate(-90deg)',
  transition: 'stroke-dashoffset 0.35s',
})

/**
 * Floating layer anchored to the bottom of the viewport, centred, and
 * click-through everywhere but on the pill itself. It stays mounted while
 * hidden so it can fade out; the delayed `visibility` and `inert` (see the
 * component) keep it away from the pointer, the tab order and screen readers
 * in between.
 *
 * Below the mini audio player (`ZINDEX_POPOVER + 1`) and the paynote bar
 * (9998), above article content (`ZINDEX_CONTENT`) — see
 * `src/components/constants.js`.
 */
const layerStyle = css({
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  left: 0,
  opacity: 0,
  paddingBottom: 'calc(15px + env(safe-area-inset-bottom))',
  paddingX: '4',
  pointerEvents: 'none',
  position: 'fixed',
  right: 0,
  transform: 'translateY(0.5rem)',
  transition:
    'opacity 200ms ease-out, transform 200ms ease-out, visibility 0s linear 200ms',
  visibility: 'hidden',
  zIndex: 16,
  '&[data-visible="true"]': {
    opacity: 1,
    transform: 'none',
    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
    visibility: 'visible',
  },
  '@media print': {
    display: 'none',
  },
})

// The pill is the same as the play action's; only the layer around it is
// click-through, so the button has to take pointer events back.
const clickableStyle = css({
  pointerEvents: 'auto',
})

/**
 * Percentage ring, adapted from the legacy `ProgressCircle`
 * (`packages/styleguide/src/components/Progress/Circle.tsx`): a `divider`
 * track behind a `currentColor` arc that fills clockwise from 12 o'clock.
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

const subscribeToScroll = (onStoreChange: () => void) => {
  window.addEventListener('scroll', onStoreChange, { passive: true })
  return () => window.removeEventListener('scroll', onStoreChange)
}

const isAtScrollTop = () => window.scrollY <= AT_TOP_THRESHOLD

// Server snapshot: there's never a position to offer before hydration anyway.
const notAtScrollTop = () => false

/**
 * Whether the reader is at the very top of the page. Reading the offset through
 * `useSyncExternalStore` makes the first client render already correct, so a
 * reader who lands mid-article — restored scroll position, anchor link — never
 * sees the action flash into view.
 */
function useAtScrollTop() {
  return useSyncExternalStore(subscribeToScroll, isAtScrollTop, notAtScrollTop)
}

/**
 * Percentage only — the counterpart to `ReadingPositionTracker`, measuring the
 * same region. There is no anchor branch: positions on Sanity articles carry no
 * `nodeId`, because the renderer emits no `[data-pos]` to name.
 */
function scrollToReadingPosition(container: Element, percentage: number) {
  const { top, height } = readingRegion(container)

  window.scrollTo({
    top: window.scrollY + top + percentage * height - scrollPaddingTop(),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  })
}

/**
 * Reading position of the current article, keyed by `sanity:<_id>` — the same
 * reference bookmarks use (see `collectionsDocumentId`). `userDocumentProgress`
 * accepts that id directly and returns the stored percentage without resolving a
 * (Sanity-backed articles have none) GraphQL `Document`.
 *
 * Only members have anything to resume — logged-out readers hit the paywall
 * before scrolling far enough to generate a position, and the query would
 * just come back null for them.
 */
function useReadingPosition({ documentId }: { documentId?: string }) {
  const { isMember, hasActiveMembership } = useMe()
  const canTrack = isMember && hasActiveMembership
  const skip = !documentId || !canTrack

  const { data, refetch } = useQuery(UserDocumentProgressDocument, {
    variables: { documentId },
    skip,
  })

  const progress = data?.userDocumentProgress
  // `max` is the furthest the reader ever got, `percentage` is where they last
  // stopped. The ring reports the furthest — as the legacy action bar did —
  // while the jump goes to the last position.
  const furthest = progress?.max?.percentage ?? progress?.percentage

  return {
    /** Rounded percentage of the furthest position, undefined while there's none. */
    percent: furthest === undefined ? undefined : Math.round(furthest * 100),
    /** Where to scroll back to, 0…1. */
    resumeAt: progress?.percentage,
    /** Undefined while the query is skipped — `refetch` would run it anyway. */
    refresh: skip ? undefined : refetch,
  }
}

export function JumpToReadingPosition({ documentId }: { documentId?: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const { percent, resumeAt, refresh } = useReadingPosition({ documentId })
  const atTop = useAtScrollTop()
  // The mini player occupies the same corner of the viewport (full width on
  // small screens), so it takes precedence.
  const { audioPlayerVisible } = useAudioContext()

  // The position moves while the reader reads, so the one this component
  // mounted with goes stale. Re-read it every time they come back to the top,
  // which is the only moment the action is offered again.
  const wasAtTop = useRef(atTop)
  useEffect(() => {
    const returnedToTop = atTop && !wasAtTop.current
    wasAtTop.current = atTop
    if (returnedToTop) {
      refresh?.()
    }
  }, [atTop, refresh])

  // Nothing to resume, or nothing left to resume to.
  if (percent === undefined || percent >= 100 || !resumeAt) {
    return null
  }

  const visible = atTop && !audioPlayerVisible

  return (
    <div className={layerStyle} data-visible={visible} inert={!visible}>
      <button
        className={cx(
          actionStyle,
          pillStyle,
          clickableStyle,
          // Same shadow the mini audio player uses for its own fixed-bottom
          // wrapper (`AudioPlayer.tsx`) — much lower alpha than `md`, which
          // reads too heavy floating over arbitrary article content.
          css({ boxShadow: 'overlay' }),
        )}
        onClick={() => {
          // The layer renders inside the <article>, which is the element the
          // stored position is measured against.
          const container = ref.current?.closest('article')
          if (container) {
            scrollToReadingPosition(container, resumeAt)
          }
        }}
        ref={ref}
        title='Weiterlesen'
        type='button'
      >
        <ReadingPositionIcon percent={percent} />
        Weiterlesen
      </button>
    </div>
  )
}
