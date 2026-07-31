'use client'

import { useAudioContext } from '@/components/Audio/AudioProvider'
import useAudioQueue from '@/components/Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
import { useMe } from '@/lib/context/MeContext'
import { IconPauseCircleOutline, IconPlayCircleOutline } from '@republik/icons'
import { css } from '@republik/theme/css'

type TeaserAudioPlayButtonProps = {
  /** Sanity `_id` of the target article */
  targetId: string
  title: string
  path: string
  publishDate?: string | null
  mp3: string
  durationMs?: number | null
  /**
   * Matches the surrounding teaser text's alignment. The button is a flex
   * item in a `flexDirection: 'column'` container, so it stretches full-width
   * by default — `text-align` on an ancestor has no effect on it, unlike the
   * plain `<p>` siblings it sits next to.
   */
  align?: 'left' | 'center'
}

/**
 * Icon-only play toggle for a front teaser. Unlike the article page's audio
 * bar, a teaser offers no explicit "add to queue" affordance — a click
 * always plays immediately (`toggleAudioPlayer` inserts-and-plays), matching
 * the legacy `TeaserAudioPlayButton`.
 */
export function TeaserAudioPlayButton({
  targetId,
  title,
  path,
  publishDate,
  mp3,
  durationMs,
  align = 'left',
}: TeaserAudioPlayButtonProps) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { isAudioQueueAvailable } = useAudioQueue()
  const { isMember } = useMe()

  if (!isAudioQueueAvailable || !isMember) {
    return null
  }

  const id = `sanity:${targetId}`
  // `mediaId` is a placeholder: the server is authoritative for it and
  // `useAudioQueue` overrides it with the ref's own `mediaId` once the queue
  // mutation comes back.
  const playerItem = {
    id,
    meta: {
      title,
      path,
      publishDate,
      audioSource: {
        mediaId: id,
        mp3,
        durationMs: durationMs ?? 0,
      },
    },
  } as unknown as AudioPlayerItem

  const isActiveAudioItem = checkIfActivePlayerItem(id)
  const itemPlaying = isPlaying && isActiveAudioItem

  return (
    <button
      className={css({
        position: 'relative', // place above the link overlay
        display: 'inline-flex',
        alignSelf: align === 'center' ? 'center' : 'flex-start',
        cursor: 'pointer',
        color: 'inherit',
      })}
      title={itemPlaying ? 'Pause' : 'Beitrag hören'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isActiveAudioItem) {
          toggleAudioPlayback()
        } else {
          toggleAudioPlayer(playerItem, AudioPlayerLocations.FRONT)
        }
      }}
    >
      {itemPlaying ? (
        <IconPauseCircleOutline size={32} />
      ) : (
        <IconPlayCircleOutline size={32} />
      )}
    </button>
  )
}
