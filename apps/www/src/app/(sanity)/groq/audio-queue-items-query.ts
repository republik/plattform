import { defineQuery } from 'next-sanity'
import type { AUDIO_QUEUE_ITEMS_QUERY_RESULT } from '@/sanity.types'

/**
 * Content for a batch of audio-queue refs, keyed by `_id` — the counterpart
 * to `userAudioQueue`'s bare `AudioQueueItemRef`s, which carry no title/
 * cover/mp3 of their own. Only `_type == "article"` can be queued at all
 * (collections API restriction), so nothing else needs selecting here.
 */
export const AUDIO_QUEUE_ITEMS_QUERY = defineQuery(`
  *[_type == "article" && _id in $ids]{
    _id,
    "title": pt::text(title),
    "path": slug.current,
    publishDate,
    audioSourceMp3,
    audioDurationMs,
    teaserSmall{ image },
    cover,
    "collectionImage": articleCollections[featured == true][0].collection->image,
  }
`)

export type AudioQueueItemContent =
  NonNullable<AUDIO_QUEUE_ITEMS_QUERY_RESULT>[number]
