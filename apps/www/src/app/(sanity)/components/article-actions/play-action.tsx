'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
import { CirclePlay, CirclePause } from 'lucide-react'
import { css, cx } from '@republik/theme/css'
import { useState } from 'react'
import { actionStyle, ACTION_ICON_SIZE, pillStyle } from './action-style'

export function PlayAction({
  documentId,
  durationMs,
  mp3,
  path,
  title,
  coverSm,
  coverSmDark,
  coverMd,
  coverMdDark,
}: {
  /** Same join key as `BookmarkAction` — see `document-id.ts`. */
  documentId: string
  durationMs?: number
  mp3?: string
  path: string
  title: string
  coverSm?: string
  coverSmDark?: string
  coverMd?: string
  coverMdDark?: string
}) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { hasPaywall } = usePaynotes()
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

  const onClick = async () => {
    if (hasPaywall) return
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
      disabled={hasPaywall}
      onClick={onClick}
      title={
        hasPaywall
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
