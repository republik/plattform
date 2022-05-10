import { createContext, useState, useEffect, useRef } from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'

export const AudioContext = createContext({
  audioSource: {},
  audioPlayerVisible: false,
  toggleAudioPlayer: () => {},
  onCloseAudioPlayer: () => {},
  audioState: {},
  autoPlayActive: false,
})

const useAudioState = createPersistedState('republik-audioplayer-audiostate')

const AudioProvider = ({ children }) => {
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const [audioState, setAudioState] = useAudioState(undefined)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const [autoPlayAudioState, setAutoPlayAudioState] = useState(false)
  const clearTimeoutId = useRef()

  const { getMediaProgress } = useMediaProgress()

  const toggleAudioPlayer = async ({ audioSource, title, path }) => {
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
