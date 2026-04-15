import { useCallback, useEffect, useRef } from 'react'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'
import { getImageCropURL } from '../helpers/getImageCropURL'
import { AudioQueueItem } from '../types/AudioPlayerItem'

type PlayerState = {
  duration: number
  playbackRate: number
  currentTime: number
}

type MediaSessionCallbacks = {
  onPlay: () => void
  onPause: () => void
  onSeekForward: (seekOffset: number) => void
  onSeekBackward: (seekOffset: number) => void
  onSkipToNext: () => void
  onStop: () => void
  onRetrievePlayerState: () => PlayerState
}

type MediaSessionOptions = {
  isPlaying: boolean
  callbacks: MediaSessionCallbacks
}

export function useMediaSession(
  playerItem: AudioQueueItem | null,
  { isPlaying, callbacks }: MediaSessionOptions,
): void {
  const callbackRefs = useRef(callbacks)

  callbackRefs.current = callbacks

  const updatePlayerState = useCallback(() => {
    if ('mediaSession' in navigator) {
      const playerState = callbackRefs.current?.onRetrievePlayerState()
      navigator.mediaSession.setPositionState({
        duration: playerState.duration,
        playbackRate: playerState.playbackRate,
        position: playerState.currentTime,
      })
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !playerItem) {
      return
    }
    const mediaSession = navigator.mediaSession

    mediaSession.metadata = new MediaMetadata({
      title: playerItem.document?.meta?.title ?? 'Ein Beitrag der Republik',
      artist: 'Republik Magazin',
      album: 'Republik «Vorgelesen»',
      artwork: [
        getMediaImage(playerItem, 96),
        getMediaImage(playerItem, 128),
        getMediaImage(playerItem, 192),
        getMediaImage(playerItem, 256),
        getMediaImage(playerItem, 384),
        getMediaImage(playerItem, 512),
      ],
    })

    if (playerItem) {
      mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

      if (callbackRefs.current) {
        mediaSession.setActionHandler('play', () => {
          callbackRefs.current.onPlay()
          updatePlayerState()
        })
        mediaSession.setActionHandler('pause', () => {
          callbackRefs.current.onPause()
          updatePlayerState()
        })
        mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
          callbackRefs.current.onSeekForward(seekOffset ?? 10)
          updatePlayerState()
        })
        mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
          callbackRefs.current.onSeekBackward(seekOffset ?? 10)
          updatePlayerState()
        })
        mediaSession.setActionHandler('nexttrack', () => {
          callbackRefs.current.onSkipToNext()
          updatePlayerState()
        })
        mediaSession.setActionHandler('stop', () => {
          callbackRefs.current.onStop()
          updatePlayerState()
        })
      }
    } else {
      mediaSession.playbackState = 'none'
      mediaSession.metadata = null
    }

    return () => {
      mediaSession.setActionHandler('play', null)
      mediaSession.setActionHandler('pause', null)
      mediaSession.setActionHandler('seekforward', null)
      mediaSession.setActionHandler('seekbackward', null)
      mediaSession.setActionHandler('nexttrack', null)
      mediaSession.setActionHandler('stop', null)
    }
  }, [JSON.stringify(playerItem), isPlaying, updatePlayerState])
}

function getMediaImage(audioItem: AudioQueueItem, size: number) {
  return {
    src:
      getImageCropURL(
        audioItem.document.meta.image ||
          CDN_FRONTEND_BASE_URL + '/static/audioplayer-fallback.png',
        size,
        audioItem.document.meta.audioCoverCrop,
      ) + '&format=webp',
    sizes: `${size}x${size}`,
    type: 'image/webp',
  }
}
