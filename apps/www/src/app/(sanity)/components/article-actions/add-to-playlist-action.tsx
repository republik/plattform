'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import useAudioQueue from '@/components/Audio/hooks/useAudioQueue'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
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
  const { isAudioQueueAvailable } = useAudioQueue()
  return !!mp3 && isAudioQueueAvailable && isMember
}

export function AddToPlaylistAction({
  documentId,
  path,
  title,
  durationMs,
  mp3,
  className,
  coverSm,
  coverSmDark,
  coverMd,
  coverMdDark,
}: {
  /** Same join key as `BookmarkAction` — see `document-id.ts`. */
  documentId: string
  path: string
  title: string
  durationMs?: number
  mp3?: string
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
  coverSm?: string
  coverSmDark?: string
  coverMd?: string
  coverMdDark?: string
}) {
  const trackEvent = useTrackEvent()
  const allowed = useAddToPlaylistAllowed(mp3)
  const [isPending, setIsPending] = useState(false)
  const { checkIfInQueue, addAudioQueueItem, removeAudioQueueItem } =
    useAudioQueue()

  if (!allowed) {
    return null
  }

  const queueItem = checkIfInQueue(documentId)

  const playerItem = {
    id: documentId,
    meta: {
      title,
      path,
      coverSm,
      coverSmDark,
      coverMd,
      coverMdDark,
      audioSource: {
        mediaId: documentId,
        mp3,
        durationMs: durationMs ?? 0,
      },
    },
  } as unknown as AudioPlayerItem

  async function toggleQueueItem() {
    if (isPending) return
    setIsPending(true)
    try {
      if (queueItem) {
        await removeAudioQueueItem(queueItem.id)
        trackEvent({ action: 'audioQueueRemove', name: path })
      } else {
        await addAudioQueueItem(playerItem)
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
      {queueItem ? 'Von Wiedergabeliste entfernen' : 'Zur Wiedergabeliste hinzufügen'}
    </button>
  )
}
