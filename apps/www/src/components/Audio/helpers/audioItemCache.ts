import { AudioPlayerItem } from '../types/AudioPlayerItem'

/**
 * The audio queue API now stores bare refs (`repoId` XOR `sanityId`) — it
 * can't hand back title/cover/mp3 for an arbitrary queue item, Sanity-backed
 * or not. Whenever a caller adds or plays an item it already has full
 * metadata for (the common case: the article page the user is on), we keep
 * it here so `useAudioQueue` can re-attach it to the matching ref once the
 * server confirms it. Items we never saw locally (e.g. queued from another
 * device) simply can't be displayed until the API grows a batched
 * lookup — see docs/content/software/architecture/collections.md.
 */
const knownAudioItems = new Map<string, AudioPlayerItem>()

export function rememberAudioItem(documentId: string, item: AudioPlayerItem) {
  if (!documentId || !item?.meta?.audioSource) return
  knownAudioItems.set(documentId, item)
}

export function getKnownAudioItem(
  documentId: string | undefined | null,
): AudioPlayerItem | undefined {
  if (!documentId) return undefined
  return knownAudioItems.get(documentId)
}
