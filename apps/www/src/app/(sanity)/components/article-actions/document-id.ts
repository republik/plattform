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
