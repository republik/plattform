'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useMe } from '@/lib/context/MeContext'
import { useTranslation } from '@/lib/withT'
import { UpsertDocumentProgressDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { css, cx } from '@republik/theme/css'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { useRef } from 'react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

// `actionStyle` assumes something clickable; the read state only reports state.
const indicatorStyle = css({
  cursor: 'default',
  _hover: { color: 'text' },
})

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
 * WRITING works: `upsertDocumentProgress` accepts a Sanity reference and returns
 * the stored values.
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
 * being undefined. Private to this module: `MarkAsRead` and
 * `JumpToReadingPosition` each call it themselves rather than receiving props
 * from the action bar.
 */
function useReadingPosition({ documentId }: { documentId?: string }) {
  const { isMember } = useMe()
  const [upsertProgress] = useMutation(UpsertDocumentProgressDocument)

  return {
    /** Rounded percentage — always undefined until the API exposes it. */
    percent: undefined as number | undefined,
    isRead: false,
    /** Stored position to scroll back to — unavailable for the same reason. */
    position: undefined as
      | { nodeId?: string | null; percentage?: number | null }
      | undefined,
    // Gated on membership because the reference now exists for every article,
    // so without this the menu would offer signed-out readers an action the API
    // rejects. Failures are swallowed with a warning, as in `PlayAction`.
    markAsRead:
      documentId && isMember
        ? async () => {
            try {
              await upsertProgress({
                variables: { documentId, percentage: 1, nodeId: '' },
              })
            } catch (error) {
              console.warn('ActionBar: could not mark article as read', error)
            }
          }
        : undefined,
  }
}

export function MarkAsRead({
  documentId,
  className,
}: {
  documentId?: string
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
}) {
  const { t } = useTranslation()
  const trackEvent = useTrackEvent()
  const { isRead, markAsRead } = useReadingPosition({ documentId })

  // Nothing left to mark once the article is read, or once we know it can't
  // be marked at all (no position reference yet, or not a member).
  if (isRead || !markAsRead) {
    return null
  }

  return (
    <button
      className={cx(actionStyle, className)}
      onClick={() => {
        markAsRead()
        trackEvent({ action: 'markAsRead', name: documentId })
      }}
      type='button'
    >
      <CircleCheck size={ACTION_ICON_SIZE} />
      {t('article/actionbar/progress/markasread')}
    </button>
  )
}

export function JumpToReadingPosition({
  documentId,
  className,
}: {
  documentId?: string
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()
  const { percent, isRead, position } = useReadingPosition({ documentId })

  if (percent === undefined) {
    return null
  }

  // A finished article has nowhere useful to jump to, so it stays a plain
  // indicator rather than a button that scrolls to the very end.
  if (isRead) {
    const read = t('article/actionbar/progress/read')
    return (
      <span
        className={cx(actionStyle, indicatorStyle, className)}
        title={read}
      >
        <CircleCheck size={ACTION_ICON_SIZE} />
        {read}
      </span>
    )
  }

  return (
    <button
      className={cx(actionStyle, className)}
      onClick={() => {
        // The action bar renders inside the <article>, which is the element the
        // stored position is measured against.
        const container = ref.current?.closest('article')
        if (container) {
          scrollToReadingPosition({ container, ...position })
        }
      }}
      ref={ref}
      title='Zur Leseposition springen'
      type='button'
    >
      <CircleDashed size={ACTION_ICON_SIZE} />
      {percent}%
    </button>
  )
}
