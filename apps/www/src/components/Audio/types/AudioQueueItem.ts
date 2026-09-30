import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { MediaProgress } from '@/components/Audio/types/MediaProgress'

/**
 * Listening position as the queue reports it — the queue's own selection, a
 * subset of what the media-progress API can return.
 */
export type AudioQueueItemProgress = Pick<MediaProgress, 'id' | 'secs'>

/**
 * A queue slot: the ref the queue API stores, joined with the Sanity content
 * it points at. `document` is `null` while that content hasn't been fetched
 * yet (or no longer exists) — such items are filtered out of the rendered
 * queue rather than shown broken.
 */
export type AudioQueueItem = {
  /**
   * The queue slot's own id. Null for an optimistic item — one the player is
   * already showing while the mutation that creates its slot is still in
   * flight (see `togglePlayer`). Such an item can't be removed or advanced
   * past, so anything keyed on this must check it first.
   */
  id: string | null
  sequence: number
  /** Key the media-progress API stores playback position under. */
  mediaId: string | null
  userProgress: AudioQueueItemProgress | null
  document: AudioQueueItemContent | null
}
