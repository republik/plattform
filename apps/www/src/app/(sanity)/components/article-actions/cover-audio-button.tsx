'use client'

import { useAudioContext } from '@/components/Audio/AudioProvider'
import { useIsAudioQueueAvailable } from '@/components/Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { collectionsDocumentId } from './document-id'
import { IconAudio } from '@republik/icons'
import { css } from '@republik/theme/css'

type CoverAudioButtonProps = {
  /** `null` for an article without audio — see `audio-item.ts`. */
  audioItem: AudioQueueItemContent | null
}

// shown on podcasts
export function CoverAudioButton({ audioItem }: CoverAudioButtonProps) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const isAudioQueueAvailable = useIsAudioQueueAvailable()

  if (!isAudioQueueAvailable || !audioItem) {
    return null
  }

  const isActiveAudioItem = checkIfActivePlayerItem(
    collectionsDocumentId(audioItem),
  )
  const itemPlaying = isPlaying && isActiveAudioItem

  return (
    <button
      type='button'
      aria-label='Podcast hören'
      className={css({
        position: 'absolute',
        top: '50%',
        left: '50%',
        borderRadius: '50%',
        color: 'white',
        cursor: 'pointer',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: -45,
        marginTop: -45,
        width: 90,
        height: 90,
        animation: 'pulse',
        '& svg': {
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '50%',
          height: '50%',
        },
        md: {
          marginLeft: -75,
          marginTop: -75,
          width: 150,
          height: 150,
        },
        _hover: {
          animationIterationCount: 'infinite',
        },
      })}
      title='Podcast hören'
      onClick={() => {
        if (itemPlaying) return
        if (isActiveAudioItem) {
          toggleAudioPlayback()
        } else {
          toggleAudioPlayer(audioItem, AudioPlayerLocations.ARTICLE)
        }
      }}
    >
      <IconAudio />
    </button>
  )
}
