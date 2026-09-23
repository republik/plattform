'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { collectionsDocumentId } from './document-id'
import { useMe } from '@/lib/context/MeContext'
import { css, cx } from '@republik/theme/css'
import { CirclePause, CirclePlay } from 'lucide-react'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionStyle, pillStyle } from './action-style'

export function PlayAction({
  audioItem,
}: {
  /** `null` for an article without audio — see `audio-item.ts`. */
  audioItem: AudioQueueItemContent | null
}) {
  // Inactive until membership is known or for non-members
  const { isMember, hasActiveMembership } = useMe()
  const canPlay = isMember && hasActiveMembership

  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const trackEvent = useTrackEvent()
  const [failed, setFailed] = useState(false)

  if (!audioItem) {
    return null
  }

  const path = audioItem.slug
  const isActive = checkIfActivePlayerItem(collectionsDocumentId(audioItem))
  const minutes = audioItem.audioDurationMs
    ? Math.round(audioItem.audioDurationMs / 60_000)
    : undefined

  const onClick = async () => {
    if (!canPlay) return

    trackEvent({ action: isActive ? 'audioToggle' : 'audioPlay', name: path })
    setFailed(false)
    try {
      if (isActive) {
        await toggleAudioPlayback()
      } else {
        await toggleAudioPlayer(audioItem, AudioPlayerLocations.ACTION_BAR)
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
      disabled={!canPlay}
      onClick={onClick}
      title={
        !canPlay
          ? 'Nur für Mitglieder'
          : failed
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
