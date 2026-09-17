import { AudioPlayerItem } from '../types/AudioPlayerItem'

/**
 * The audio queue API now stores bare refs (`repoId` XOR `sanityId`) — it
 * can't hand back title/cover/mp3 for an arbitrary queue item, Sanity-backed
 * or not. Whenever a caller adds or plays an item it already has full
 * metadata for (the common case: the article page the user is on), we keep
 * it here so `useAudioQueue` can re-attach it to the matching ref once the
 * server confirms it.
 *
 * Sanity-backed refs the session never saw are filled in by `hydrateAudioItems`
 * below. That has to live here rather than in `useAudioQueue` state: the hook
 * is not a context, so a feed page mounts dozens of independent instances
 * (one per teaser, see components/teaser/feed/teaser-actions.tsx). With
 * per-instance state each one computed the same missing ids and fired its own
 * `/api/sanity/audio-queue-items` request. Caching module-side — and sharing
 * the in-flight promise — collapses those to a single request, and the result
 * survives unmounts instead of being refetched by the next instance.
 */
const knownAudioItems = new Map<string, AudioPlayerItem>()

/** Request ids currently being fetched, so concurrent callers don't duplicate. */
const inFlightIds = new Set<string>()

const listeners = new Set<() => void>()
let version = 0

function notify() {
  version += 1
  listeners.forEach((listener) => listener())
}

export function rememberAudioItem(documentId: string, item: AudioPlayerItem) {
  if (!documentId || !item?.meta?.audioSource) return
  knownAudioItems.set(documentId, item)
  notify()
}

export function getKnownAudioItem(
  documentId: string | undefined | null,
): AudioPlayerItem | undefined {
  if (!documentId) return undefined
  return knownAudioItems.get(documentId)
}

/** For `useSyncExternalStore`, so hooks re-render when hydration lands. */
export function subscribeToAudioItems(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAudioItemsVersion() {
  return version
}

/**
 * Fetch and cache metadata for `ids` that aren't already being fetched.
 * Returns a promise only when a request was actually issued, so callers can
 * report failures without having to know whether they were the one to fire it.
 */
export function hydrateAudioItems(
  ids: string[],
  load: (ids: string[]) => Promise<Array<[string, AudioPlayerItem]>>,
): Promise<void> | undefined {
  const pending = ids.filter((id) => id && !inFlightIds.has(id))
  if (!pending.length) return undefined

  pending.forEach((id) => inFlightIds.add(id))

  return load(pending)
    .then((entries) => {
      let changed = false
      entries.forEach(([documentId, item]) => {
        if (!documentId || !item?.meta?.audioSource) return
        knownAudioItems.set(documentId, item)
        changed = true
      })
      if (changed) notify()
    })
    .finally(() => {
      pending.forEach((id) => inFlightIds.delete(id))
    })
}
