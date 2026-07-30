'use client'

import { css, cx } from '@republik/theme/css'
import { useRef } from 'react'
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
 * reference bookmarks use (see `collectionsDocumentId`).
 *
 * READING does not exist yet. `userCollectionItem(collectionName: "progress")`
 * returns a `CollectionItemRef` — `{ id, createdAt, repoId, sanityId }` — which
 * says *that* a position is stored but not what it is; `percentage`, `nodeId` and
 * `max` are not selectable on it, and there is no root `documentProgress` field.
 * `Document.userProgress` is no help either: Sanity-backed items resolve to a
 * null `Document` by design.
 *
 * So the position indicator cannot render and scroll restore has nothing to
 * restore to. Both come back as soon as the API exposes the values by document
 * id — at which point this hook regains its query and `percent`/`position` stop
 * being undefined.
 */
function useReadingPosition({ documentId }: { documentId?: string }) {
  return {
    /** Rounded percentage — always undefined until the API exposes it. */
    percent: undefined as number | undefined,
    isRead: false,
    /** Stored position to scroll back to — unavailable for the same reason. */
    position: undefined as
      | { nodeId?: string | null; percentage?: number | null }
      | undefined,
  }
}

export function JumpToReadingPosition({
  documentId,
}: {
  documentId?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const { percent, position } = useReadingPosition({ documentId })

  if (percent === undefined) {
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
