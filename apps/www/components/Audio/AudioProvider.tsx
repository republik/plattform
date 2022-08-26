import { createContext, useState, useEffect, useRef, useContext } from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'
import compareVersion from '../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from './constants'
import { AudioPlayerItem } from './types/AudioPlayerItem'
import { PlaylistItemFragment } from './graphql/PlaylistItemGQLFragment'

type ToggleAudioPlayerFunc = (playerItem: AudioPlayerItem) => void

type AudioContextValue = {
  activePlayerItem: AudioPlayerItem | null
  queue: PlaylistItemFragment[]
  audioPlayerVisible: boolean
  autoPlayActive: boolean
  toggleAudioPlayer: ToggleAudioPlayerFunc
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
  activePlayerItem: null,
  autoPlayActive: false,
})

export const useAudioContext = () => useContext(AudioContext)

const usePersistedPlayerItem = createPersistedState<AudioPlayerItem>(
  'republik-audioplayer-audiostate',
)

const AudioProvider = ({ children }) => {
  const { inNativeApp, inNativeAppVersion, inNativeIOSApp } = useInNativeApp()
  const [activePlayerItem, setActivePlayerItem] = usePersistedPlayerItem<
    AudioPlayerItem | undefined
  >(undefined)
  const [autoPlayAudioPlayerItem, setAutoPlayAudioPlayerItem] =
    useState<AudioPlayerItem | null>(null)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const clearTimeoutId = useRef<NodeJS.Timeout | null>()

  const { getMediaProgress } = useMediaProgress()

  const toggleAudioPlayer = async (playerItem: AudioPlayerItem) => {
    const {
      meta: { audioSource, path, title },
    } = playerItem
    const url = (
      (inNativeIOSApp && audioSource.aac) ||
      audioSource.mp3 ||
      audioSource.ogg
    )?.trim()
    if (!url) {
      return
    }
    const mediaId = audioSource.mediaId

    if (
      inNativeApp &&
      // check if current version is smaller than NEW_AUDIO_API_VERSION
      compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) < 0
    ) {
      let currentTime
      if (mediaId) {
        currentTime = await getMediaProgress({ mediaId })
      }
      // The below constructed payload is required by the legacy in-app
      // audio player.
      const payload = {
        audioSource,
        url,
        title,
        sourcePath: path,
        mediaId,
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
    setActivePlayerItem(playerItem)
    setAutoPlayAudioPlayerItem(playerItem)
    clearTimeout(clearTimeoutId.current)
  }

  const onCloseAudioPlayer = () => {
    console.log('onCloseAudioPlayer')
    setAudioPlayerVisible(false)
    clearTimeoutId.current = setTimeout(() => {
      setActivePlayerItem(undefined)
    }, 300)
  }

  useEffect(() => {
    setAudioPlayerVisible(!!activePlayerItem)
  }, [activePlayerItem])

  return (
    <AudioContext.Provider
      value={{
        toggleAudioPlayer,
        onCloseAudioPlayer,
        audioPlayerVisible,
        activePlayerItem,
        autoPlayActive: autoPlayAudioPlayerItem === activePlayerItem,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
