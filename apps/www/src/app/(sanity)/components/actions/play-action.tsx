'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { AudioPlayerLocations } from '@/components/Audio/types/AudioActionTracking'
import type { AudioPlayerItem } from '@/components/Audio/types/AudioPlayerItem'
import { CirclePlay, CirclePause } from 'lucide-react'
import { css, cx } from '@republik/theme/css'
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
  sanityId,
  title,
}: {
  /** Collections-API id; undefined when the article has no `repoId`. */
  documentId?: string
  durationMs?: number
  mp3?: string
  path: string
  sanityId: string
  title: string
}) {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const trackEvent = useTrackEvent()

  if (!mp3) {
    return null
  }

  const id = documentId ?? sanityId
  const isActive = checkIfActivePlayerItem(id)
  const minutes = durationMs ? Math.round(durationMs / 60_000) : undefined

  // Shaped like the legacy Document the audio player expects. Playback for
  // signed-in users goes through the audio queue, which resolves the item
  // server-side and today requires a published legacy document — until the
  // collections API accepts Sanity content, that call can reject, so failures
  // are swallowed rather than surfaced.
  const playerItem = {
    id,
    meta: {
      title,
      path,
      audioSource: {
        mediaId: id,
        mp3,
        durationMs: durationMs ?? 0,
      },
    },
  } as unknown as AudioPlayerItem

  const onClick = async () => {
    trackEvent({ action: isActive ? 'audioToggle' : 'audioPlay', name: path })
    try {
      if (isActive) {
        await toggleAudioPlayback()
      } else {
        await toggleAudioPlayer(playerItem, AudioPlayerLocations.ACTION_BAR)
      }
    } catch (error) {
      console.warn('ActionBar: could not start audio playback', error)
    }
  }

  return (
    <button
      className={cx(actionStyle, pillStyle)}
      data-active={isActive || undefined}
      onClick={onClick}
      title={isActive && isPlaying ? 'Pausieren' : 'Anhören'}
      type='button'
    >
      {isActive && isPlaying ? (
        <CirclePause size={ACTION_ICON_SIZE} />
      ) : (
        <CirclePlay size={ACTION_ICON_SIZE} />
      )}
      {minutes ? `${minutes} Min.` : 'Anhören'}
    </button>
  )
}
