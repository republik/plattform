'use client'

import {
  AudioQueueAvailabilityContext,
  AudioQueueContext,
  useAudioQueueState,
} from './hooks/useAudioQueue'

/**
 * Owns the single audio-queue instance for the app: one Apollo watch, one
 * persisted-state instance, one Sanity hydration effect. Consumers read it
 * through `useAudioQueue` / `useIsAudioQueueAvailable`.
 *
 * Must be mounted above `AudioProvider`, which consumes the queue itself.
 * Before this existed, `useAudioQueue` was a plain hook and every consumer
 * re-ran all of the above — a feed page mounts dozens (one per teaser, see
 * components/teaser/feed/teaser-actions.tsx).
 */
export default function AudioQueueProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const value = useAudioQueueState()

  return (
    <AudioQueueAvailabilityContext.Provider value={value.isAudioQueueAvailable}>
      <AudioQueueContext.Provider value={value}>
        {children}
      </AudioQueueContext.Provider>
    </AudioQueueAvailabilityContext.Provider>
  )
}
