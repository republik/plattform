'use client'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'

import { postMessage } from '@/lib/withInNativeApp'
import EventEmitter from 'events'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useIsAudioQueueAvailable } from './hooks/useAudioQueue'
import { AudioPlayerLocations } from './types/AudioActionTracking'
import { AudioQueueItem } from './types/AudioQueueItem'

/**
 * Where the removed legacy web player persisted its last track. Nothing
 * reads it any more, but returning readers still carry one, so it's swept
 * below rather than left behind. Safe to drop once that has had time to run
 * everywhere — say, a release or two.
 */
const LEGACY_PLAYER_STORAGE_KEY = 'republik-audioplayer-audiostate'

export enum AudioContextEvent {
  TOGGLE_PLAYER = 'togglePlayer',
  TOGGLE_PLAYBACK = 'togglePlayback',
  ADD_AUDIO_QUEUE_ITEM = 'addAudioQueueItem',
  REMOVE_AUDIO_QUEUE_ITEM = 'removeAudioQueueItem',
}

type ToggleAudioPlayerFunc = (
  playerItem: AudioQueueItemContent,
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
  audioPlayerVisible: boolean
  setAudioPlayerVisible: Dispatch<SetStateAction<boolean>>
  isExpanded: boolean
  setIsExpanded: Dispatch<SetStateAction<boolean>>
  isPlaying: boolean
  setIsPlaying: Dispatch<SetStateAction<boolean>>
  toggleAudioPlayer: ToggleAudioPlayerFunc
  toggleAudioPlayback: () => void
  checkIfActivePlayerItem: (documentId: string) => boolean
  addAudioQueueItem: (item: AudioQueueItemContent, position?: number) => void
  removeAudioQueueItem: (audioQueueItemId: string) => void
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
  activePlayerItem: null,
  setActivePlayerItem: notImplemented,
})

export const useAudioContext = () => useContext<AudioContextValue>(AudioContext)

const AudioProvider = ({ children }) => {
  const [activePlayerItem, setActivePlayerItem] =
    useState<AudioQueueItem | null>(null)
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isAudioQueueAvailable = useIsAudioQueueAvailable()

  const toggleAudioPlayer = async (
    playerItem: AudioQueueItemContent,
    location?: AudioPlayerLocations,
  ) => {
    const { slug, title } = playerItem
    const url = playerItem.audioSourceMp3?.trim()
    if (!url) {
      return
    }
    if (isAudioQueueAvailable) {
      // AudioEventEmitter.emit doesn't wait for (or propagate errors from)
      // listeners, so without this bridge the promise below would resolve
      // immediately regardless of whether playback actually started — the
      // caller's try/catch would never see a failure.
      await new Promise<void>((resolve, reject) => {
        AudioEventEmitter.emit(AudioContextEvent.TOGGLE_PLAYER, {
          item: playerItem,
          location: location || AudioPlayerLocations.AUDIO_PLAYER,
          onSettled: (error?: unknown) => (error ? reject(error) : resolve()),
        })
      })
    } else {
      // The queue is unavailable only in a native app below v2.2.0, so this
      // branch is always in-app: hand the track to the app's own player in
      // the payload shape that version expects.
      postMessage({
        type: 'play-audio',
        payload: {
          // Same reasoning as `toNativeAppTrack`: this shape is frozen by app
          // versions and cannot be updated without an app update
          audioSource: {
            mediaId: null,
            kind: playerItem.syntheticVoiceEnabled
              ? 'syntheticReadAloud'
              : 'readAloud',
            mp3: url,
            aac: null,
            ogg: null,
            durationMs: playerItem.audioDurationMs ?? null,
            userProgress: null,
          },
          url,
          title,
          sourcePath: slug,
          mediaId: null,
          currentTime: null,
        },
      })
    }
  }

  const addAudioQueueItem = (
    item: AudioQueueItemContent,
    position?: number,
  ) => {
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

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_PLAYER_STORAGE_KEY)
    } catch (e) {
      // Blocked or unavailable storage — then there's nothing to clean up.
    }
  }, [])

  const checkIfActivePlayerItem = useMemo(
    () => (documentId: string) => {
      const activeDocument = activePlayerItem?.document
      return (
        !!activeDocument && collectionsDocumentId(activeDocument) === documentId
      )
    },
    [activePlayerItem],
  )

  return (
    <AudioContext.Provider
      value={{
        activePlayerItem,
        setActivePlayerItem,
        audioPlayerVisible,
        setAudioPlayerVisible,
        isExpanded,
        setIsExpanded,
        isPlaying,
        setIsPlaying,
        toggleAudioPlayer,
        toggleAudioPlayback,
        checkIfActivePlayerItem,
        addAudioQueueItem,
        removeAudioQueueItem,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider
