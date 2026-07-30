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

// Publikator ids reach the Document loader through an Elasticsearch query
// filtered to `type: 'Document'`, so they are guaranteed to be articles. The
// Sanity branch had no equivalent constraint, which let *any* document id — an
// author, a `page`/Spitzmarke, an `articleCollection`, a settings singleton —
// be bookmarked, progressed or queued.
//
// TODO confirm against the studio schema: this repo does not contain it, so
// the literal is inferred from lib/article.ts's references to `page` and
// `articleCollection` as separate types.
// Note this is deliberately about *collections* (bookmarks, progress, audio
// queue), not about what may be referenced in general: subscriptions/follows
// legitimately target a format or an articleCollection, so the Document loader
// itself stays permissive and the check belongs at the collection write sites.
export const COLLECTABLE_TYPES = ['article']

export const isCollectableType = (type?: string) =>
  !!type && COLLECTABLE_TYPES.includes(type)

// Generic (not article-specific) lookup by a raw Sanity `_id`. Used both by the
// Document loader's Sanity branch and by callers that already know they're
// holding a Sanity id.
//
// Published only: this is a member-facing read path, so it must not surface
// drafts. `perspective` is passed explicitly rather than left to the default —
// the default only became `published` as of apiVersion v2025-02-19, and
// SANITY_API_VERSION is env-overridable, so an older value would silently
// reinstate `raw`. (`raw` stays in lib/audio.ts and lib/article.ts, where
// pre-publish access is the point.)
export const fetchDocumentById = (id: string) =>
  sanityClient().fetch<GenericDocument | null>(
    // No `drafts.` companion lookup: under `published` such an id can never match.
    `*[_id == $id][0]{ _id, _type, title, slug }`,
    { id: id.replace(/^drafts\./, '') },
    { perspective: 'published' },
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
