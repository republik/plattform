import { createSanityClient } from './client'
import { repoIdToSanityId } from './legacyId'

// Built on first use, not at import time: the SANITY_* env vars this needs
// aren't necessarily loaded when this module is imported. A script's ES
// imports are hoisted above its `env.config()` call, so building the client
// eagerly would read an empty environment (see script/migrate-legacy-references.ts).
let client: ReturnType<typeof createSanityClient> | undefined
const sanityClient = () => (client ??= createSanityClient())

// Explicit marker for a Sanity-backed reference stored in a plain, FK-less
// text column (subscriptions.objectDocumentId / collectionDocumentItems.repoId)
// that otherwise holds a publikator repoId. Deterministic branch on read
// instead of guessing from id shape, and makes stored values unambiguous.
const SANITY_ID_PREFIX = 'sanity:'

export const toSanityRef = (id: string) =>
  `${SANITY_ID_PREFIX}${id.replace(/^drafts\./, '')}`

export const isSanityRef = (value: string) => value.startsWith(SANITY_ID_PREFIX)

export const fromSanityRef = (value: string) => value.slice(SANITY_ID_PREFIX.length)

export interface GenericDocument {
  _id: string
  _type: string
  title?: string
  slug?: { current: string }
}

// Generic (not article-specific) lookup by a raw Sanity `_id`, published or
// draft. Used both by the Document loader's Sanity branch and by callers
// that already know they're holding a Sanity id.
export const fetchDocumentById = (id: string) =>
  sanityClient().fetch<GenericDocument | null>(
    `*[_id in [$id, $draftId]][0]{ _id, _type, title, slug }`,
    { id, draftId: `drafts.${id.replace(/^drafts\./, '')}` },
    { perspective: 'raw' },
  )

// Reverse lookup: given a legacy publikator repoId, find the Sanity document
// migrated from it. The one-time import (studio's
// import/publikator/src/generateUUID.ts) minted each migrated doc's `_id`
// deterministically from its repoId (uuidv5, fixed namespace) — so this is
// a computation, not a query. This is the join key for translating existing
// subscriptions/bookmarks once their content moves to Sanity.
export const fetchDocumentByLegacyRepoId = (repoId: string) => {
  let sanityId: string
  try {
    sanityId = repoIdToSanityId(repoId)
  } catch {
    // repoId wasn't a valid "owner/repo"-shaped github path — definitely
    // not a legacy-migrated document.
    return Promise.resolve(null)
  }
  return fetchDocumentById(sanityId)
}
