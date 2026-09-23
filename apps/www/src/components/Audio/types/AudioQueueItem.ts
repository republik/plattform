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
  id: string
  sequence: number
  /** Key the media-progress API stores playback position under. */
  mediaId: string | null
  userProgress: AudioQueueItemProgress | null
  document: AudioQueueItemContent | null
}
