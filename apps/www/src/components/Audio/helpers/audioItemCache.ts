import { AudioPlayerItem } from '../types/AudioPlayerItem'

/**
 * The audio queue API stores bare refs (a `sanityId`, no content), so the
 * player's metadata comes from two places: whatever a caller already had when
 * it added or played an item, kept here so it can render immediately, and the
 * authoritative copy `hydrateAudioItems` fetches from Sanity.
 *
 * Module-level rather than `useAudioQueue` state, so the cache and the
 * in-flight bookkeeping are shared and survive unmounts instead of being
 * refetched by the next consumer.
 */
const knownAudioItems = new Map<string, AudioPlayerItem>()

/** Request ids currently being fetched, so concurrent callers don't duplicate. */
const inFlightIds = new Set<string>()

/**
 * Ids already fetched, so a second pass doesn't refetch them. Kept separate
 * from `knownAudioItems`: a locally remembered item is not proof that Sanity
 * has been consulted, and Sanity is the richer source (see below).
 */
const hydratedIds = new Set<string>()

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
 * Fetch and cache metadata for `ids` not already fetched or in flight, and let
 * the result replace whatever was remembered locally.
 *
 * Overwriting is the point. What a caller remembers when it starts playback is
 * only as good as the props it had: `PlayAction` builds its item without a
 * `publishDate`, and from a feed teaser without a cover either. Left in place,
 * that stub is what the player renders — and because it counts as "known", it
 * used to suppress the very request that would have filled in the gaps, so the
 * image and date only appeared after a reload cleared the cache. For a
 * fetched item is a superset of the stub, so it always wins.
 *
 * Returns a promise only when a request was actually issued, so callers can
 * report failures without having to know whether they were the one to fire it.
 */
export function hydrateAudioItems(
  ids: string[],
  load: (ids: string[]) => Promise<Array<[string, AudioPlayerItem]>>,
): Promise<void> | undefined {
  const pending = ids.filter(
    (id) => id && !inFlightIds.has(id) && !hydratedIds.has(id),
  )
  if (!pending.length) return undefined

  pending.forEach((id) => inFlightIds.add(id))

  return load(pending)
    .then((entries) => {
      // Mark the whole batch, not just what came back: an id with no matching
      // article would otherwise be retried on every queue change.
      pending.forEach((id) => hydratedIds.add(id))

      let changed = false
      entries.forEach(([documentId, item]) => {
        if (!documentId || !item?.meta?.audioSource) return
        knownAudioItems.set(documentId, item)
        changed = true
      })
      if (changed) notify()
    })
    .finally(() => {
      // Failures stay unmarked, so the next queue change can retry them.
      pending.forEach((id) => inFlightIds.delete(id))
    })
}
