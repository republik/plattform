import type {
  AUDIO_QUEUE_ITEMS_QUERY_RESULT,
  LATEST_AUDIO_ARTICLES_QUERY_RESULT,
} from '@/sanity.types'
import { defineQuery } from 'next-sanity'

/**
 * Everything the audio player renders for one track. The queue API itself
 * stores bare refs (a `sanityId`, no content), so this is the only source of
 * a track's title/cover/mp3 — both for the queue and for the player's
 * "Latest" tab.
 */
export const AUDIO_ITEM_FRAGMENT = /* groq */ `
  _id,
  "title": pt::text(title),
  "slug": slug.current,
  publishDate,
  audioSourceMp3,
  audioDurationMs,
  syntheticVoiceEnabled,
  "image": teaserSmall.image
`

/**
 * Content for a batch of audio-queue refs, keyed by `_id` — the counterpart
 * to `userAudioQueue`'s bare `AudioQueueItemRef`s. Only `_type == "article"`
 * can be queued at all (collections API restriction), so nothing else needs
 * selecting here.
 */
export const AUDIO_QUEUE_ITEMS_QUERY = defineQuery(`
  *[_type == "article" && _id in $ids]{
    ${AUDIO_ITEM_FRAGMENT}
  }
`)

/**
 * The player's "Latest" tab: recently published articles that have audio.
 * Paged by cursor rather than slice offset, matching `ARTICLES_QUERY`.
 */
export const LATEST_AUDIO_ARTICLES_QUERY = defineQuery(`
  *[
    _type == "article" &&
    defined(audioSourceMp3) &&
    (
      !defined($lastPublishDate) ||
      publishDate < $lastPublishDate ||
      (publishDate == $lastPublishDate && _id > $lastId)
    )
  ] | order(publishDate desc, _id asc) [0...$limit] {
    ${AUDIO_ITEM_FRAGMENT}
  }
`)

export type AudioQueueItemContent =
  NonNullable<AUDIO_QUEUE_ITEMS_QUERY_RESULT>[number]

// The two queries share `AUDIO_ITEM_FRAGMENT`, so this is the same shape —
// asserted here so a change to one query can't silently drift from the other.
export type LatestAudioArticle =
  NonNullable<LATEST_AUDIO_ARTICLES_QUERY_RESULT>[number]
