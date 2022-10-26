import {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'
import { AudioPlayerItem } from './types/AudioPlayerItem'
import useAudioQueue from './hooks/useAudioQueue'
import EventEmitter from 'events'

export enum AudioContextEvent {
  TOGGLE_PLAYER = 'togglePlayer',
  RESET_ACTIVE_PLAYER_ITEM = 'resetActivePlayerItem',
}

type ToggleAudioPlayerFunc = (playerItem: AudioPlayerItem) => void

export const AudioEventEmitter = new EventEmitter()

type EventHandler<E> = (eventData: E) => Promise<void> | void

/**
 * useAudioEvent allows to subscribe to events emitted by the audio-context.
 * @param eventName The name of the event to subscribe to.
 * @param callback The handler to call when the event is emitted.
 */
export function useAudioContextEvent<E = Event>(
  eventName: string,
  callback: EventHandler<E>,
) {
  const savedCallback = useRef<EventHandler<E>>(callback)

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    const handler = (eventData: E) => {
      return savedCallback?.current(eventData)
    }

    AudioEventEmitter.addListener(eventName, handler)
    return () => {
      AudioEventEmitter.removeListener(eventName, handler)
    }
  }, [eventName])
}

type AudioContextValue = {
  activePlayerItem: AudioPlayerItem | null
  audioPlayerVisible: boolean
  setAudioPlayerVisible: Dispatch<SetStateAction<boolean>>
  isExpanded: boolean
  setIsExpanded: Dispatch<SetStateAction<boolean>>
  isPlaying: boolean
  setIsPlaying: Dispatch<SetStateAction<boolean>>
  autoPlayActive: boolean
  toggleAudioPlayer: ToggleAudioPlayerFunc
  onCloseAudioPlayer: () => void
  resetActivePlayerItem: () => void
}

export const AudioContext = createContext<AudioContextValue>({
  audioPlayerVisible: false,
  isExpanded: false,
  isPlaying: false,
  setAudioPlayerVisible: () => {
    throw new Error('not implemented')
  },
  setIsExpanded: () => {
    throw new Error('not implemented')
  },
  setIsPlaying: () => {
    throw new Error('not implemented')
  },
  toggleAudioPlayer: () => {
    throw new Error('not implemented')
  },
  onCloseAudioPlayer: () => {
    throw new Error('not implemented')
  },
  resetActivePlayerItem: () => {
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
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const [activePlayerItem, setActivePlayerItem] = usePersistedPlayerItem<
    AudioPlayerItem | undefined
  >(undefined)
  const [autoPlayAudioPlayerItem, setAutoPlayAudioPlayerItem] =
    useState<AudioPlayerItem | null>(null)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
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
      await addAudioQueueItem(playerItem, 1)
      AudioEventEmitter.emit(AudioContextEvent.TOGGLE_PLAYER)
    } else {
      if (inNativeApp) {
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
      }
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

  const resetActivePlayerItem = () => {
    AudioEventEmitter.emit(AudioContextEvent.RESET_ACTIVE_PLAYER_ITEM)
  }

  useEffect(() => {
    setAudioPlayerVisible(!!activePlayerItem)
  }, [activePlayerItem])

  return (
    <AudioContext.Provider
      value={{
        activePlayerItem,
        audioPlayerVisible,
        setAudioPlayerVisible,
        isExpanded,
        setIsExpanded,
        isPlaying,
        setIsPlaying,
        autoPlayActive: autoPlayAudioPlayerItem === activePlayerItem,
        toggleAudioPlayer,
        onCloseAudioPlayer,
        resetActivePlayerItem,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
