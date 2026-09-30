'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import useAudioQueue, {
  useIsAudioQueueAvailable,
} from '@/components/Audio/hooks/useAudioQueue'
import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { collectionsDocumentId } from './document-id'
import { useMe } from '@/lib/context/MeContext'
import { cx } from '@republik/theme/css'
import { ListMusic, ListX } from 'lucide-react'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

/**
 * Whether the "add to playlist" item should render at all — used both by
 * `AddToPlaylistAction` itself and by its callers to decide whether a "..."
 * menu containing only this item should show its trigger.
 */
export function useAddToPlaylistAllowed(mp3?: string): boolean {
  const { isMember } = useMe()
  const isAudioQueueAvailable = useIsAudioQueueAvailable()
  return !!mp3 && isAudioQueueAvailable && isMember
}

export function AddToPlaylistAction({
  audioItem,
  className,
}: {
  /** `null` for an article without audio — see `audio-item.ts`. */
  audioItem: AudioQueueItemContent | null
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
}) {
  const trackEvent = useTrackEvent()
  const allowed = useAddToPlaylistAllowed(audioItem?.audioSourceMp3 ?? undefined)
  const [isPending, setIsPending] = useState(false)
  const { checkIfInQueue, addAudioQueueItem, removeAudioQueueItem } =
    useAudioQueue()

  if (!allowed || !audioItem) {
    return null
  }

  const path = audioItem.slug
  const queueItem = checkIfInQueue(collectionsDocumentId(audioItem))

  async function toggleQueueItem() {
    if (isPending) return
    setIsPending(true)
    try {
      if (queueItem) {
        await removeAudioQueueItem(queueItem.id)
        trackEvent({ action: 'audioQueueRemove', name: path })
      } else {
        await addAudioQueueItem(audioItem)
        trackEvent({ action: 'audioQueueAdd', name: path })
      }
    } catch (error) {
      console.warn('ActionBar: could not update audio queue', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      className={cx(actionStyle, className)}
      disabled={isPending}
      onClick={toggleQueueItem}
      type='button'
    >
      {queueItem ? (
        <ListX size={ACTION_ICON_SIZE} />
      ) : (
        <ListMusic size={ACTION_ICON_SIZE} />
      )}
      {queueItem
        ? 'Von Wiedergabeliste entfernen'
        : 'Zur Wiedergabeliste hinzufügen'}
    </button>
  )
}
