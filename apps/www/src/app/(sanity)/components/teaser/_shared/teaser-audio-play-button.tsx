'use client'

import { useAudioContext } from '@/components/Audio/AudioProvider'
import { useIsAudioQueueAvailable } from '@/components/Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { useMe } from '@/lib/context/MeContext'
import { IconPauseCircleOutline, IconPlayCircleOutline } from '@republik/icons'
import { css } from '@republik/theme/css'

type TeaserAudioPlayButtonProps = {
  /** `null` for an article without audio — see `audio-item.ts`. */
  audioItem: AudioQueueItemContent | null
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
  audioItem,
  align = 'left',
}: TeaserAudioPlayButtonProps) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const isAudioQueueAvailable = useIsAudioQueueAvailable()
  const { isMember } = useMe()

  if (!isAudioQueueAvailable || !isMember || !audioItem) {
    return null
  }

  const isActiveAudioItem = checkIfActivePlayerItem(
    collectionsDocumentId(audioItem),
  )
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
          toggleAudioPlayer(audioItem, AudioPlayerLocations.FRONT)
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
