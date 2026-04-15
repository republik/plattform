import {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react'

import createPersistedState from '../../lib/hooks/use-persisted-state'
import { useInNativeApp, postMessage } from '../../lib/withInNativeApp'

import { useMediaProgress } from './MediaProgress'
import { AudioPlayerItem, AudioQueueItem } from './types/AudioPlayerItem'
import useAudioQueue from './hooks/useAudioQueue'
import EventEmitter from 'events'
import { AudioPlayerLocations } from './types/AudioActionTracking'

export enum AudioContextEvent {
  TOGGLE_PLAYER = 'togglePlayer',
  TOGGLE_PLAYBACK = 'togglePlayback',
  ADD_AUDIO_QUEUE_ITEM = 'addAudioQueueItem',
  REMOVE_AUDIO_QUEUE_ITEM = 'removeAudioQueueItem',
}

type ToggleAudioPlayerFunc = (
  playerItem: AudioPlayerItem,
  location?: AudioPlayerLocations,
) => void

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
  activePlayerItem: AudioQueueItem | null
  setActivePlayerItem: Dispatch<SetStateAction<AudioQueueItem | null>>
  legacyPlayerItem: AudioPlayerItem | undefined
  audioPlayerVisible: boolean
  setAudioPlayerVisible: Dispatch<SetStateAction<boolean>>
  isExpanded: boolean
  setIsExpanded: Dispatch<SetStateAction<boolean>>
  isPlaying: boolean
  setIsPlaying: Dispatch<SetStateAction<boolean>>
  autoPlayActive: boolean
  toggleAudioPlayer: ToggleAudioPlayerFunc
  toggleAudioPlayback: () => void
  checkIfActivePlayerItem: (documentId: string) => boolean
  addAudioQueueItem: (item: AudioPlayerItem, position?: number) => void
  removeAudioQueueItem: (audioQueueItemId: string) => void
  onCloseAudioPlayer: () => void
}

const notImplemented = () => {
  throw new Error('Not implemented')
}

export const AudioContext = createContext<AudioContextValue>({
  audioPlayerVisible: false,
  isExpanded: false,
  isPlaying: false,
  setAudioPlayerVisible: notImplemented,
  setIsExpanded: notImplemented,
  setIsPlaying: notImplemented,
  toggleAudioPlayer: notImplemented,
  toggleAudioPlayback: notImplemented,
  checkIfActivePlayerItem: notImplemented,
  addAudioQueueItem: notImplemented,
  removeAudioQueueItem: notImplemented,
  onCloseAudioPlayer: notImplemented,
  activePlayerItem: null,
  setActivePlayerItem: notImplemented,
  legacyPlayerItem: undefined,
  autoPlayActive: false,
})

export const useAudioContext = () => useContext<AudioContextValue>(AudioContext)

const usePersistedLegacyPlayerItem = createPersistedState<AudioPlayerItem>(
  'republik-audioplayer-audiostate',
)

const AudioProvider = ({ children }) => {
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
  const [legacyPlayerItem, setLegacyPlayerItem] = usePersistedLegacyPlayerItem<
    AudioPlayerItem | undefined
  >(undefined)
  const [autoPlayAudioPlayerItem, setAutoPlayAudioPlayerItem] =
    useState<AudioPlayerItem | null>(null)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const clearTimeoutId = useRef<NodeJS.Timeout | null>(null)

  const { isAudioQueueAvailable } = useAudioQueue()
  const { getMediaProgress } = useMediaProgress()

  const toggleAudioPlayer = async (
    playerItem: AudioPlayerItem,
    location?: AudioPlayerLocations,
  ) => {
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
      AudioEventEmitter.emit(AudioContextEvent.TOGGLE_PLAYER, {
        item: playerItem,
        location: location || AudioPlayerLocations.AUDIO_PLAYER,
      })
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
      setLegacyPlayerItem(playerItem)
      setAutoPlayAudioPlayerItem(playerItem)
    }
    clearTimeout(clearTimeoutId.current)
  }

  const onCloseAudioPlayer = () => {
    setAudioPlayerVisible(false)
    clearTimeoutId.current = setTimeout(() => {
      setActivePlayerItem(undefined)
      setLegacyPlayerItem(undefined)
    }, 300)
  }

  const addAudioQueueItem = (item: AudioPlayerItem, position?: number) => {
    AudioEventEmitter.emit(AudioContextEvent.ADD_AUDIO_QUEUE_ITEM, {
      item,
      position,
    })
  }

  const removeAudioQueueItem = (audioQueueItemId: string) => {
    AudioEventEmitter.emit(
      AudioContextEvent.REMOVE_AUDIO_QUEUE_ITEM,
      audioQueueItemId,
    )
  }

  const toggleAudioPlayback = () => {
    AudioEventEmitter.emit(AudioContextEvent.TOGGLE_PLAYBACK)
  }

  const checkIfActivePlayerItem = useMemo(
    () => (documentId: string) => {
      return activePlayerItem?.document?.id === documentId
    },
    [activePlayerItem],
  )

  // Legacy in-app audio player this will open up the player for the last played element
  // This may be deleted sometime in the future once every app version below v2.2.0 is discontinued
  useEffect(() => {
    setAudioPlayerVisible(!!legacyPlayerItem)
  }, [legacyPlayerItem])

  // This clears the persisted active-player state in the browser or the native app.
  // If a value was persisted the above effect kept on opening the player.
  useEffect(() => {
    if (isAudioQueueAvailable) {
      setLegacyPlayerItem(null)
    }
  }, [isAudioQueueAvailable])

  return (
    <AudioContext.Provider
      value={{
        activePlayerItem,
        setActivePlayerItem,
        legacyPlayerItem,
        audioPlayerVisible,
        setAudioPlayerVisible,
        isExpanded,
        setIsExpanded,
        isPlaying,
        setIsPlaying,
        autoPlayActive:
          autoPlayAudioPlayerItem?.id === activePlayerItem?.document.id,
        toggleAudioPlayer,
        toggleAudioPlayback,
        checkIfActivePlayerItem,
        addAudioQueueItem,
        removeAudioQueueItem,
        onCloseAudioPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
