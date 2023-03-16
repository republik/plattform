import { useCallback, useEffect, useRef } from 'react'
import { getImageCropURL } from '../AudioPlayer/ui/AudioCover'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'

type PlayerState = {
  duration: number
  playbackRate: number
  currentTime: number
}

type MediaSessionCallbacks = {
  onPlay: () => void
  onPause: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
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
) {
  const callbackRefs = useRef(callbacks)

  useEffect(() => {
    callbackRefs.current = callbacks
  }, [callbacks])

  const updatePlayerState = useCallback(() => {
    if ('mediaSession' in navigator) {
      const playerState = callbackRefs.current.onRetrievePlayerState()
      navigator.mediaSession.setPositionState({
        duration: playerState.duration,
        playbackRate: playerState.playbackRate,
        position: playerState.currentTime,
      })
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }
    const mediaSession = navigator.mediaSession
    console.debug({
      playerItem,
      isPlaying,
      mediaSession,
    })

    mediaSession.metadata = new MediaMetadata({
      title: playerItem.document?.meta?.title || 'Ein Beitrag der Republik',
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

    console.log('mediaSession', mediaSession.metadata)

    if (playerItem) {
      mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

      if (callbackRefs?.current) {
        mediaSession.setActionHandler('play', () => {
          callbackRefs.current.onPlay()
          updatePlayerState()
        })
        mediaSession.setActionHandler('pause', () => {
          callbackRefs.current.onPause()
          updatePlayerState()
        })
        mediaSession.setActionHandler('seekto', () => {
          updatePlayerState
        })
        mediaSession.setActionHandler('seekforward', () => {
          callbackRefs.current.onSeekForward()
          updatePlayerState()
        })
        mediaSession.setActionHandler('seekbackward', () => {
          callbackRefs.current.onSeekBackward()
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
    }

    return () => {
      mediaSession.setActionHandler('play', null)
      mediaSession.setActionHandler('pause', null)
      mediaSession.setActionHandler('seekto', null)
      mediaSession.setActionHandler('seekforward', null)
      mediaSession.setActionHandler('seekbackward', null)
      mediaSession.setActionHandler('nexttrack', null)
    }
  }, [JSON.stringify(playerItem), isPlaying, updatePlayerState])
}

function getMediaImage(audioItem: AudioQueueItem, size: number) {
  return {
    src:
      getImageCropURL(
        audioItem.document.meta.image,
        size,
        audioItem.document.meta.audioCoverCrop,
      ) + '&format=png',
    sizes: `${size}x${size}`,
    type: 'image/png',
  }
}
