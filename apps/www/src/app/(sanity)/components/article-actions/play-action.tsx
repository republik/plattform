'use client'

import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import { useMe } from '@/lib/context/MeContext'
import { IconPauseCircleOutline, IconPlayCircleOutline } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionStyle, pillStyle } from './action-style'
import { collectionsDocumentId } from './document-id'

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
        <IconPauseCircleOutline size={ACTION_ICON_SIZE + 2} />
      ) : (
        <IconPlayCircleOutline
          className={failed ? css({ color: 'error' }) : undefined}
          size={ACTION_ICON_SIZE + 2}
        />
      )}
      {minutes ? `${minutes} Min.` : 'Anhören'}
    </button>
  )
}
