'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
import { CirclePlay, CirclePause } from 'lucide-react'
import { css, cx } from '@republik/theme/css'
import { useState } from 'react'
import { actionStyle, ACTION_ICON_SIZE } from './action-style'

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

export function PlayAction({
  documentId,
  durationMs,
  mp3,
  path,
  title,
}: {
  /** Same join key as `BookmarkAction` — see `document-id.ts`. */
  documentId: string
  durationMs?: number
  mp3?: string
  path: string
  title: string
}) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const trackEvent = useTrackEvent()
  const [failed, setFailed] = useState(false)

  if (!mp3) {
    return null
  }

  const isActive = checkIfActivePlayerItem(documentId)
  const minutes = durationMs ? Math.round(durationMs / 60_000) : undefined

  // Shaped like the legacy Document the audio player expects.
  const playerItem = {
    id: documentId,
    meta: {
      title,
      path,
      audioSource: {
        mediaId: documentId,
        mp3,
        durationMs: durationMs ?? 0,
      },
    },
  } as unknown as AudioPlayerItem

  const onClick = async () => {
    trackEvent({ action: isActive ? 'audioToggle' : 'audioPlay', name: path })
    setFailed(false)
    try {
      if (isActive) {
        await toggleAudioPlayback()
      } else {
        await toggleAudioPlayer(playerItem, AudioPlayerLocations.ACTION_BAR)
      }
    } catch (error) {
      setFailed(true)
      console.warn('ActionBar: could not start audio playback', error)
    }
  }

  return (
    <button
      className={cx(actionStyle, pillStyle)}
      data-active={isActive || undefined}
      onClick={onClick}
      title={
        failed
          ? 'Wiedergabe fehlgeschlagen'
          : isActive && isPlaying
            ? 'Pausieren'
            : 'Anhören'
      }
      type='button'
    >
      {isActive && isPlaying ? (
        <CirclePause size={ACTION_ICON_SIZE} />
      ) : (
        <CirclePlay
          className={failed ? css({ color: 'error' }) : undefined}
          size={ACTION_ICON_SIZE}
        />
      )}
      {minutes ? `${minutes} Min.` : 'Anhören'}
    </button>
  )
}
