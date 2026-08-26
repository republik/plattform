import { AudioQueueItemFragment } from '#graphql/republik-api/__generated__/gql/graphql'

/**
 * Shape of a playable item: title/cover/mp3 etc. The audio queue API itself
 * only ever hands back bare refs (`repoId` XOR `sanityId`, no content) — this
 * shape is always sourced from wherever the caller already has the content
 * loaded (an article page, a teaser list, …), never from the queue response
 * itself. See `helpers/audioItemCache.ts`.
 */
export type AudioPlayerItem = NonNullable<AudioQueueItemFragment['document']> & {
  /**
   * `cover`/`coverDark` carry a single square crop used at every render size
   * (40/62/90px) — unlike legacy's `coverSm`/`coverMd`, which are genuinely
   * distinct pre-sized images from the old backend. Legacy content has no
   * dark variant at all, so `coverDark` is only ever set here.
   */
  meta: { cover?: string; coverDark?: string }
}

/**
 * A queue slot. `document` is `null` when the item is a ref the client
 * doesn't have cached metadata for (e.g. queued from another device) — such
 * items are filtered out of the rendered queue rather than shown broken.
 */
export type AudioQueueItem = {
  id: string
  sequence: number
  document: AudioPlayerItem | null
}
