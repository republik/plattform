'use client'

import { useAudioContext } from '@/components/Audio/AudioProvider'
import { useIsAudioQueueAvailable } from '@/components/Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
import { IconAudio } from '@republik/icons'
import { css } from '@republik/theme/css'

type CoverAudioButtonProps = {
  /** Sanity `_id` of the target article */
  targetId: string
  title: string
  path: string
  publishDate?: string | null
  mp3?: string
  durationMs?: number | null
}

// shown on podcasts
export function CoverAudioButton({
  targetId,
  title,
  path,
  publishDate,
  mp3,
  durationMs,
}: CoverAudioButtonProps) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const isAudioQueueAvailable = useIsAudioQueueAvailable()

  if (!isAudioQueueAvailable || !mp3) {
    return null
  }

  const id = `sanity:${targetId}`
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
          toggleAudioPlayer(playerItem, AudioPlayerLocations.ARTICLE)
        }
      }}
    >
      <IconAudio />
    </button>
  )
}
