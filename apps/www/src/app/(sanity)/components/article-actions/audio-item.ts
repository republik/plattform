import type { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'

/**
 * The content the audio player renders for a track. Every teaser and article
 * query already selects these fields under these names, so a caller can hand
 * over what it loaded as-is; `useAudioQueue` replaces it with the full
 * `AUDIO_QUEUE_ITEMS_QUERY` result as soon as that lands.
 */
type PlayableArticle = {
  _id: string
  /** Plain text, not portable text — the player renders it as a string. */
  title: string
  slug: string | null
  publishDate?: string | null
  audioSourceMp3?: string | null
  audioDurationMs?: number | null
  syntheticVoiceEnabled?: boolean | null
  image?: AudioQueueItemContent['image']
}

/**
 * An article with no mp3 isn't playable. Returning `null` for it is the
 * signal the play and queue buttons render on, so the rule lives here rather
 * than at each of their call sites.
 */
export function audioItemFromArticle(
  article: PlayableArticle,
): AudioQueueItemContent | null {
  if (!article?.audioSourceMp3) {
    return null
  }
  // Fields a caller's own query didn't select are widened to null, so the
  // stub matches what `AUDIO_QUEUE_ITEMS_QUERY` returns for the same article.
  return {
    publishDate: null,
    audioDurationMs: null,
    syntheticVoiceEnabled: null,
    image: null,
    ...article,
    audioSourceMp3: article.audioSourceMp3,
  }
}
