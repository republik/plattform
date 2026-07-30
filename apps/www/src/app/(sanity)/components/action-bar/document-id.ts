/**
 * Identifiers the collections API (bookmarks, reading position, audio queue)
 * uses for a Sanity-backed article.
 *
 * There are two, because the backend adopted Sanity ids per feature rather than
 * all at once (see docs/content/software/architecture/collections.md):
 *
 * - Bookmarks and reading position accept `sanity:<_id>` directly.
 * - The audio queue does not yet: `addAudioQueueItem` with a `sanity:` ref fails
 *   with "Dokument nicht gefunden", so it still needs the base64 `repoId` and
 *   resolves through the loader's legacy-id rescue.
 *
 * When the audio queue accepts Sanity ids too, `audioQueueDocumentId` collapses
 * into `collectionsDocumentId` and this module is the only place that changes.
 */

/**
 * Reference for bookmarks and reading position.
 *
 * Always available — unlike the legacy id, this needs no `repoId`, so articles
 * authored natively in Sanity get these features too.
 */
export function collectionsDocumentId(article: { _id: string }): string {
  // Preview renders draft documents, whose `_id` carries a `drafts.` prefix.
  // Collections must key off the published id, or a reader's bookmark would
  // depend on how they happened to open the article.
  return `sanity:${article._id.replace(/^drafts\./, '')}`
}

/**
 * Reference for the audio queue.
 *
 * Today the API derives the repo from a base64-encoded document id — see the
 * `addAudioQueueItem` resolver in `packages/backend-modules/collections`.
 * Returns undefined when the article has no `repoId`, which is the signal that
 * the audio queue cannot be offered for it.
 */
export function audioQueueDocumentId(article: {
  repoId?: string | null
}): string | undefined {
  const { repoId } = article
  if (!repoId) {
    return undefined
  }
  return btoa(repoId)
}
