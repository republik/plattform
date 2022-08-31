import { createContext, useState, useEffect, useRef, useContext } from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'
import { AudioPlayerItem } from './types/AudioPlayerItem'
import useAudioQueue from './hooks/useAudioQueue'
import EventEmitter from 'events'

type ToggleAudioPlayerFunc = (playerItem: AudioPlayerItem) => void

export const AudioEventEmitter = new EventEmitter()

type AudioContextValue = {
  activePlayerItem: AudioPlayerItem | null
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
  const { inNativeIOSApp } = useInNativeApp()
  const [activePlayerItem, setActivePlayerItem] = usePersistedPlayerItem<
    AudioPlayerItem | undefined
  >(undefined)
  const [autoPlayAudioPlayerItem, setAutoPlayAudioPlayerItem] =
    useState<AudioPlayerItem | null>(null)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const clearTimeoutId = useRef<NodeJS.Timeout | null>()

  const { addAudioQueueItem, isAudioQueueAvailable } = useAudioQueue()
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

    if (isAudioQueueAvailable) {
      addAudioQueueItem({
        variables: {
          entity: {
            id: playerItem.id,
            type: 'Document',
          },
          sequence: 1,
        },
      }).then(() => {
        AudioEventEmitter.emit('togglePlayer')
      })
    } else {
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
      setActivePlayerItem(playerItem)
      setAutoPlayAudioPlayerItem(playerItem)
    }
    clearTimeout(clearTimeoutId.current)
  }

  const onCloseAudioPlayer = () => {
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
        activePlayerItem,
        audioPlayerVisible,
        autoPlayActive: autoPlayAudioPlayerItem === activePlayerItem,
        toggleAudioPlayer,
        onCloseAudioPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
