'use client'

import { useMe } from '@/lib/context/MeContext'
import { useQuery } from '@apollo/client'
import { UserDocumentProgressDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { css, cx } from '@republik/theme/css'
import { ArrowDown, CircleCheck } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'
import {
  readingContainer,
  readingRegion,
  scrollPaddingTop,
} from './reading-region'

// Both take their colour from the inverted pill. Keyed on an attribute to
// outrank `actionStyle`'s colour, cursor and hover: `cx` doesn't resolve
// conflicting atomic classes.
const resumeStyle = css({
  '&[data-resume]': {
    color: 'inherit',
    _hover: { color: 'inherit', opacity: 0.8 },
  },
})

const readStyle = css({
  '&[data-read]': {
    color: 'inherit',
    cursor: 'default',
    margin: 0,
    _hover: { color: 'inherit' },
  },
})

const subscribeToViewport = (onStoreChange: () => void) => {
  window.addEventListener('scroll', onStoreChange, { passive: true })
  window.addEventListener('resize', onStoreChange)
  return () => {
    window.removeEventListener('scroll', onStoreChange)
    window.removeEventListener('resize', onStoreChange)
  }
}

const isNearTop = () => window.scrollY < window.innerHeight

const notNearTop = () => false

/**
 * Whether the reader is within the first screen of the page. Read through
 * `useSyncExternalStore` so the first client render is already correct, and a
 * reader landing mid-article never sees the offer flash into view before the
 * top-actions observer (`useArticleActions`) reports.
 */
export function useNearTop() {
  return useSyncExternalStore(subscribeToViewport, isNearTop, notNearTop)
}

/**
 * Percentage only: positions on Sanity articles carry no `nodeId`, because the
 * renderer emits no `[data-pos]` anchors.
 */
function scrollToReadingPosition(percentage: number) {
  const container = readingContainer()
  if (!container) {
    return
  }
  const { top, height } = readingRegion(container)

  window.scrollTo({
    top: window.scrollY + top + percentage * height - scrollPaddingTop(),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  })
}

/**
 * Stored reading position, keyed by `sanity:<_id>` (see
 * `collectionsDocumentId`). Members only: everyone else hits the paywall before
 * a position is ever recorded.
 */
export function useReadingPosition({ documentId }: { documentId?: string }) {
  const { isMember, hasActiveMembership } = useMe()
  const canTrack = isMember && hasActiveMembership
  const skip = !documentId || !canTrack

  const { data, refetch } = useQuery(UserDocumentProgressDocument, {
    variables: { documentId },
    skip,
  })

  const progress = data?.userDocumentProgress
  // `max` is the furthest the reader ever got, `percentage` where they last
  // stopped: the ring shows the former, the jump goes to the latter.
  const furthest = progress?.max?.percentage ?? progress?.percentage
  const percent =
    furthest === undefined ? undefined : Math.round(furthest * 100)

  return {
    /** Furthest position in whole percent, undefined while there's none. */
    percent,
    read: percent !== undefined && percent >= 100,
    /** Where to scroll back to, 0…1. */
    resumeAt: progress?.percentage,
    /** Undefined while the query is skipped — `refetch` would run it anyway. */
    refresh: skip ? undefined : refetch,
  }
}

export function ResumeButton({ resumeAt }: { resumeAt: number }) {
  return (
    <button
      className={cx(actionStyle, resumeStyle)}
      data-resume
      onClick={() => scrollToReadingPosition(resumeAt)}
      title='Weiterlesen'
      type='button'
    >
      <ArrowDown size={ACTION_ICON_SIZE} />
      Weiterlesen
    </button>
  )
}

export function ReadStatus() {
  return (
    <p className={cx(actionStyle, readStyle)} data-read>
      <CircleCheck size={ACTION_ICON_SIZE} />
      Gelesen
    </p>
  )
}
