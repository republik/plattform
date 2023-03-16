import { useEffect, useRef } from 'react'
import { AudioQueueItem } from '../graphql/AudioQueueHooks'

type MediaSessionCallbacks = {
  onPlay: () => void
  onPause: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
  onSkipToNext: () => void
  onStop: () => void
}

export function useMediaSession(
  playerItem: AudioQueueItem | null,
  isPlaying: boolean,
  callbacks: MediaSessionCallbacks,
) {
  const callbackRefs = useRef(callbacks)

  useEffect(() => {
    callbackRefs.current = callbacks
  }, [callbacks])

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
      artist: 'Republik «Vorgelesen»',
      album: 'Republik Magazin',
      artwork: [
        {
          src: playerItem.document.meta.coverMd,
          sizes: '256x256',
          type: 'image/jpeg',
        },
      ],
    })

    if (callbackRefs?.current) {
      mediaSession.setActionHandler('play', () => callbackRefs.current.onPlay())
      mediaSession.setActionHandler('pause', () =>
        callbackRefs.current.onPause(),
      )
      mediaSession.setActionHandler('seekto', (details) => {
        console.log(details)
      })
      mediaSession.setActionHandler('seekforward', (details) => {
        console.log(details)
        callbackRefs.current.onSeekForward()
      })
      mediaSession.setActionHandler('seekbackward', (details) => {
        console.log(details)
        callbackRefs.current.onSeekBackward()
      })
      mediaSession.setActionHandler('nexttrack', (details) => {
        callbackRefs.current.onSkipToNext()
      })
      mediaSession.setActionHandler('stop', (details) => {
        console.log(details)
        callbackRefs.current.onStop()
      })
    }

    return () => {
      mediaSession.setActionHandler('play', null)
      mediaSession.setActionHandler('pause', null)
      mediaSession.setActionHandler('seekto', null)
      mediaSession.setActionHandler('seekforward', null)
      mediaSession.setActionHandler('seekbackward', null)
      mediaSession.setActionHandler('nexttrack', null)
    }
  }, [playerItem, isPlaying])

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return
    }
    const mediaSession = navigator.mediaSession
    if (playerItem) {
      mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } else {
      mediaSession.playbackState = 'none'
    }
  }, [isPlaying, playerItem])
}
