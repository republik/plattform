'use client'

import { useMe } from '@/lib/context/MeContext'
import { useQuery } from '@apollo/client'
import { UserDocumentProgressDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { css, cx } from '@republik/theme/css'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

const trackStyle = css({
  color: 'divider',
})

const arcStyle = css({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  transform: 'rotate(-90deg)',
  transition: 'stroke-dashoffset 0.35s',
})

const pillStyle = css({
  alignItems: 'center',
  backgroundColor: 'hover',
  borderRadius: '9999px',
  display: 'inline-flex',
  gap: '2',
  paddingLeft: '2',
  paddingRight: '3',
  paddingY: '2',
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

/**
 * Delays revealing the row by one render pass so the pre-insertion
 * `document.documentElement.scrollHeight` can be captured cleanly, then
 * compensates if it lands above the reader's current scroll position — an
 * insertion within view is fine to just show as-is. Not relying on the
 * browser's native scroll anchoring (`overflow-anchor`, on by default): it
 * didn't prevent the jump in testing.
 *
 * The extra render happens inside `useLayoutEffect`, so the state update it
 * schedules re-renders and re-flushes layout effects before the browser
 * paints — no flicker, and no need to keep measuring on every render.
 */
function useScrollShiftReveal(
  ref: RefObject<HTMLElement | null>,
  hasPosition: boolean,
) {
  const [visible, setVisible] = useState(false)
  const baselineScrollHeight = useRef(0)

  useLayoutEffect(() => {
    if (!hasPosition || visible) return
    baselineScrollHeight.current = document.documentElement.scrollHeight
    setVisible(true)
  }, [hasPosition, visible])

  useLayoutEffect(() => {
    if (!visible) return
    const el = ref.current
    if (!el || el.getBoundingClientRect().bottom > 0) return

    const delta =
      document.documentElement.scrollHeight - baselineScrollHeight.current
    if (delta > 0) {
      window.scrollBy({ top: delta, behavior: 'instant' })
    }
  }, [visible])

  return visible
}

function scrollToReadingPosition({
  container,
  nodeId,
  percentage,
}: {
  container: Element
  nodeId?: string | null
  percentage?: number | null
}) {
  const behavior: ScrollBehavior = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
    ? 'auto'
    : 'smooth'

  const anchor = nodeId
    ? container.querySelector(`[data-pos="${CSS.escape(nodeId)}"]`)
    : null

  if (anchor) {
    // Already fully in view — a reader who asked to jump here is already here.
    const { top, bottom } = anchor.getBoundingClientRect()
    if (top >= 0 && bottom <= window.innerHeight) {
      return
    }
    anchor.scrollIntoView({ behavior, block: 'start' })
    return
  }

  if (percentage) {
    const { top, height } = container.getBoundingClientRect()
    // `scroll-padding-top` applies to scroll-into-view and snapping, not to
    // programmatic scrollTo — so read the same value rather than reintroducing
    // a constant that would drift from it.
    const offset =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
      0
    window.scrollTo({
      top: window.scrollY + top + percentage * height - offset,
      behavior,
    })
  }
}

/**
 * Reading position of the current article, keyed by `sanity:<_id>` — the same
 * reference bookmarks use (see `collectionsDocumentId`). `userDocumentProgress`
 * accepts that id directly and returns the stored `percentage`/`nodeId`
 * without resolving a (Sanity-backed articles have none) GraphQL `Document`.
 *
 * Only members have anything to resume — logged-out readers hit the paywall
 * before scrolling far enough to generate a position, and the query would
 * just come back null for them.
 */
function useReadingPosition({ documentId }: { documentId?: string }) {
  const { isMember, hasActiveMembership } = useMe()
  const canTrack = isMember && hasActiveMembership

  const { data } = useQuery(UserDocumentProgressDocument, {
    variables: { documentId },
    skip: !documentId || !canTrack,
  })

  const progress = data?.userDocumentProgress

  return {
    /** Rounded percentage, undefined while there's no stored position. */
    percent: progress ? Math.round(progress.percentage * 100) : undefined,
    isRead: false,
    /** Stored position to scroll back to. */
    position: progress
      ? { nodeId: progress.nodeId, percentage: progress.percentage }
      : undefined,
  }
}

export function JumpToReadingPosition({
  documentId,
}: {
  documentId?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const { position, percent } = useReadingPosition({ documentId })

  const visible = useScrollShiftReveal(ref, percent !== undefined)

  if (percent === undefined || !visible) {
    return null
  }

  return (
    <button
      className={cx(actionStyle, pillStyle)}
      onClick={() => {
        // The action bar renders inside the <article>, which is the element the
        // stored position is measured against.
        const container = ref.current?.closest('article')
        if (container) {
          scrollToReadingPosition({ container, ...position })
        }
      }}
      ref={ref}
      title='Weiterlesen'
      type='button'
    >
      <ReadingPositionIcon percent={percent} />
      Weiterlesen
    </button>
  )
}
