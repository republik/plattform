'use client'

import { useMe } from '@/lib/context/MeContext'
import { useMutation } from '@apollo/client'
import { UpsertReadingPositionDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { css } from '@republik/theme/css'
import debounce from 'lodash/debounce'
import { useEffect, useRef } from 'react'
import { readingEndAttribute, readingPercentage } from './reading-region'

const SAVE_DEBOUNCE_MS = 300

/**
 * Below this, there is nothing worth coming back to — a reader who nudged the
 * page shouldn't be offered a jump back to it. Stands in for the legacy
 * tracker's `MIN_INDEX`, which ignored the first two content blocks.
 */
const MIN_SAVED_PERCENTAGE = 0.02

// Purely a measuring point, not a block: the content grid spaces every direct
// child with a top margin, which the utilities layer overrides back to zero.
const markerStyle = css({
  height: 0,
  marginTop: 0,
})

/**
 * Records how far the reader gets, and marks the end of the editorial content
 * for `readingRegion`. Render it as a sibling of the content blocks, directly
 * after them.
 *
 * Percentage only, no `nodeId`: the legacy tracker stored the closest
 * `[data-pos]` anchor, and the Sanity portable-text renderer emits none. The
 * mutation requires the field, so it goes out empty, and
 * `JumpToReadingPosition` restores by percentage — the path it already took
 * whenever an anchor had disappeared from a re-edited article.
 */
export function ReadingPositionTracker({ documentId }: { documentId: string }) {
  const marker = useRef<HTMLDivElement>(null)
  const [upsertReadingPosition] = useMutation(UpsertReadingPositionDocument)

  // Writing is gated the same way reading is (`useReadingPosition`), plus the
  // opt-out: readers who declined progress tracking in their settings are not
  // tracked here either.
  const { isMember, hasActiveMembership, progressConsent } = useMe()
  const canTrack = isMember && hasActiveMembership && progressConsent

  // The scroll handler stays mounted for the lifetime of the article and reads
  // whatever is current here, rather than being torn down and rebuilt (losing
  // its pending call) every time `me` resolves.
  const latest = useRef({ canTrack, documentId, upsertReadingPosition })
  useEffect(() => {
    latest.current = { canTrack, documentId, upsertReadingPosition }
  })

  useEffect(() => {
    let lastY: number | undefined
    let lastSavedPercent: number | undefined

    const save = debounce(() => {
      const { canTrack, documentId, upsertReadingPosition } = latest.current
      const container = marker.current?.closest('article')
      if (!canTrack || !container) {
        return
      }

      // Measured between debounced calls rather than per event, to handle bouncy
      // upward scroll on iOS: y200 → y250 while scrolling, then a bounce back to
      // y210. Only downward movement counts as reading.
      const y = window.scrollY
      const downwards = lastY === undefined || y > lastY
      lastY = y
      if (!downwards) {
        return
      }

      const percentage = readingPercentage(container)
      // Whole percent is the granularity the ring renders at, so anything finer
      // would be another request for an identical picture.
      const percent = Math.floor(percentage * 100)
      if (percentage < MIN_SAVED_PERCENTAGE || percent === lastSavedPercent) {
        return
      }
      lastSavedPercent = percent

      upsertReadingPosition({
        variables: { documentId, percentage, nodeId: '' },
      }).catch((error) => {
        // Let the next scroll retry this percentage. Failures are swallowed
        // with a warning, as elsewhere in the action bar.
        lastSavedPercent = undefined
        console.warn('ReadingPosition: could not save position', error)
      })
    }, SAVE_DEBOUNCE_MS)

    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.removeEventListener('scroll', save)
      save.cancel()
    }
  }, [])

  return <div className={markerStyle} ref={marker} {...readingEndAttribute} />
}
