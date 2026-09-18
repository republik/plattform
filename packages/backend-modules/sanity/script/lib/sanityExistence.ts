import { fetchDocumentsByIds } from '../../lib/document'

// Sanity's `_id in $ids` filter has no problem with large arrays (the client
// switches to POST once the query would exceed a GET URL's length), but
// chunking keeps any one request/response modest and matches the batching
// idiom already used elsewhere in this codebase (e.g.
// search-typesense/script/reindex.ts's ARTICLE_BATCH_SIZE).
const BATCH_SIZE = 500

const chunk = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

// Checks which of the given Sanity ids actually have a document, in a
// handful of batched requests instead of one existence-check API call per
// id -- shared by migrate-legacy-collection-items.ts and
// migrate-legacy-subscriptions.ts, both of which otherwise awaited one
// Sanity round trip per distinct legacy repoId.
export const fetchExistingSanityDocsById = async (
  ids: string[],
): Promise<Map<string, { _id: string }>> => {
  const existingDocsById = new Map<string, { _id: string }>()
  for (const idsBatch of chunk(ids, BATCH_SIZE)) {
    const docs = await fetchDocumentsByIds(idsBatch)
    for (const doc of docs) existingDocsById.set(doc._id, doc)
  }
  return existingDocsById
}
