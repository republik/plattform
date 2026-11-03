/**
 * Reference for bookmarks, the audio queue, and reading position — the join
 * key the collections API (Postgres) uses for content it can't see itself
 * (title, cover, mp3, … all live in Sanity). See
 * docs/content/software/architecture/collections.md.
 *
 * Preview renders draft documents, whose `_id` carries a `drafts.` prefix.
 * Collections must key off the published id, or a reader's bookmark/queue
 * item would depend on how they happened to open the article.
 */
export function collectionsDocumentId(article: { _id: string }): string {
  return `sanity:${article._id.replace(/^drafts\./, '')}`
}

/**
 * Audio playback-progress key for an article, mirroring the backend's
 * `sanityAudioMediaId` (packages/backend-modules/sanity/lib/mediaId.ts)
 * exactly: `base64(sanityId + "/audio")`. A *different* key than
 * `collectionsDocumentId` above — that one is the bookmarks/queue/reading-
 * position join key, this one is the audio-progress table's key — so the two
 * must never be swapped for one another.
 *
 * Computed here, not fetched, so the queue's optimistic item (set before the
 * queue-mutation round trip resolves the real item) can save/read progress
 * immediately instead of during a window where progress silently can't be
 * saved. Safe to duplicate the formula client-side only because this is its
 * one and only client: the native app embeds a web view of this same site
 * rather than shipping its own compiled copy of this logic.
 */
export function audioMediaId(article: { _id: string }): string {
  return btoa(`${article._id.replace(/^drafts\./, '')}/audio`)
}
