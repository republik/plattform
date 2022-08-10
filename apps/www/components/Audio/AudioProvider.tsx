import { createContext, useState, useEffect, useRef, useContext } from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'
import { AudioSource } from './types/AudioSource'

type AudioState = {
  audioSource: AudioSource
  url: string
  title: string
  sourcePath: string
  mediaId: string
}

type AudioContextValue = {
  audioState: AudioState | null
  audioPlayerVisible: boolean
  autoPlayActive: boolean
  toggleAudioPlayer: (payload: {
    audioSource: AudioSource
    title: string
    path: string
  }) => void
  onCloseAudioPlayer: () => void
}

export const AudioContext = createContext<AudioContextValue>({
  audioPlayerVisible: false,
  toggleAudioPlayer: () => {
    throw new Error('not implemented')
  },
  onCloseAudioPlayer: () => {
    throw new Error('not implemented')
  },
  audioState: null,
  autoPlayActive: false,
})

export const useAudioContext = () => useContext(AudioContext)

const useAudioState = createPersistedState<AudioState>(
  'republik-audioplayer-audiostate',
)

const AudioProvider = ({ children }) => {
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const [audioState, setAudioState] = useAudioState<AudioState | undefined>(
    undefined,
  )
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const [autoPlayAudioState, setAutoPlayAudioState] = useState(null)
  const clearTimeoutId = useRef<NodeJS.Timeout | null>()

  const { getMediaProgress } = useMediaProgress()

  const toggleAudioPlayer = async ({
    audioSource,
    title,
    path,
  }: {
    audioSource: AudioSource
    title: string
    path: string
  }) => {
    console.log('AudioProvider', {
      audioSource,
      title,
      path,
    })
    const url = (
      (inNativeIOSApp && audioSource.aac) ||
      audioSource.mp3 ||
      audioSource.ogg
    )?.trim()
    if (!url) {
      return
    }
    const mediaId = audioSource.mediaId
    const payload = {
      audioSource,
      url,
      title,
      sourcePath: path,
      mediaId,
    }
    if (inNativeApp) {
      let currentTime
      if (mediaId) {
        currentTime = await getMediaProgress({ mediaId })
      }
      postMessage({
        type: 'play-audio',
        payload: {
          ...payload,
          currentTime,
        },
      })
      return
    }
    setAudioState(payload)
    setAutoPlayAudioState(payload)
    clearTimeout(clearTimeoutId.current)
  }

  const onCloseAudioPlayer = () => {
    console.log('onCloseAudioPlayer')
    setAudioPlayerVisible(false)
    clearTimeoutId.current = setTimeout(() => {
      setAudioState(undefined)
    }, 300)
  }

  useEffect(() => {
    setAudioPlayerVisible(!!audioState)
  }, [audioState])

  return (
    <AudioContext.Provider
      value={{
        toggleAudioPlayer,
        onCloseAudioPlayer,
        audioPlayerVisible,
        audioState,
        autoPlayActive: autoPlayAudioState === audioState,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
