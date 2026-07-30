import { sanityClient } from './client'
import { repoIdToSanityId } from './legacyId'

// Explicit marker for a Sanity-backed reference stored in a plain, FK-less
// text column (subscriptions.objectDocumentId / collectionDocumentItems.repoId)
// that otherwise holds a publikator repoId. Deterministic branch on read
// instead of guessing from id shape, and makes stored values unambiguous.
const SANITY_ID_PREFIX = 'sanity:'

// `drafts.<id>` and `<id>` are the same document under the `published`
// perspective, which is all the member-facing reads below use — so this is the
// form ids are compared and looked up in.
export const publishedId = (id: string) => id.replace(/^drafts\./, '')

export const toSanityRef = (id: string) =>
  `${SANITY_ID_PREFIX}${publishedId(id)}`

export const isSanityRef = (value: string) => value.startsWith(SANITY_ID_PREFIX)

export const fromSanityRef = (value: string) =>
  value.slice(SANITY_ID_PREFIX.length)

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
    { id: publishedId(id) },
    { perspective: 'published' },
  )

// Reverse lookup: given a legacy publikator repoId, the `_id` of the Sanity
// document migrated from it. The one-time import (studio's
// import/publikator/src/generateUUID.ts) minted each migrated doc's `_id`
// deterministically from its repoId (uuidv5, fixed namespace) — so this is
// a computation, not a query. This is the join key for translating existing
// subscriptions/bookmarks once their content moves to Sanity.
//
// `repoIdToSanityId` throws when the input isn't an "owner/repo"-shaped github
// path, which for an untrusted id just means "not a legacy repoId" — hence
// undefined rather than an error.
export const legacySanityId = (repoId: string): string | undefined => {
  try {
    return repoIdToSanityId(repoId)
  } catch {
    return undefined
  }
}

export const fetchDocumentByLegacyRepoId = (repoId: string) => {
  const sanityId = legacySanityId(repoId)
  return sanityId ? fetchDocumentById(sanityId) : Promise.resolve(null)
}
