import { logger } from '@orbiting/backend-modules-logger'
import { sanityClient } from './client'

// Portable text: a heterogeneous array of block/object nodes. The exact
// per-node shape is defined by studio's schema (a separate repo, no shared
// type package) — modeling it precisely here would drift the moment that
// schema changes without this repo knowing. `unknown[]` says "it's an array
// of *something*" honestly, rather than a stale, falsely-precise type.
export type PortableTextBlocks = unknown[]

export interface ArticleDoc {
  _id: string
  _rev: string
  title?: PortableTextBlocks
  description?: PortableTextBlocks
  byline?: PortableTextBlocks
  content?: PortableTextBlocks
  slug?: { current: string }
  syntheticVoice?: string
  syntheticVoiceEnabled?: boolean
  // Hash of the speakable fields as of the last successful generation (see
  // hashSpeakableContent) — lets this handler recognize a request for
  // already-generated content itself, rather than trusting sync-audio's own
  // copy of that same check to have caught it first.
  audioContentHash?: string
  audioGenerationResult?: { status?: string; updatedAt?: string }
  // In-flight placeholder entries currently sitting in audioVersions (see
  // hasPendingVersion below) — a slim projection, not the full array, since
  // this is only ever used to check "is there already a pending generation
  // for this exact content hash".
  pendingAudioVersions?: { contentHash?: string; generatedAt?: string }[]
  // Only needed to derive a preview slug (see tts/lib/deriveSlug.ts) when
  // slug is empty — an automatic-slug article deliberately has no stored
  // slug until it's actually published, but Huebsch's intake API requires
  // attrs.slug regardless. Aliased to segment/template (deriveSlug's
  // HeadingSlugConfig shape) in the query below, matching studio's own
  // HEADING_SLUG_CONFIG_QUERY convention.
  publishDate?: string
  heading?: { segment?: string | null; template?: string | null }
}

export const fetchArticle = (documentId: string) =>
  // `documentId` is very often a `drafts.*` id (the sync-audio Function fires
  // with includeDrafts: true so generation doesn't require publishing first).
  // The client's default query perspective excludes drafts entirely — a plain
  // fetch by _id silently returns null for one. `raw` matches the literal
  // document regardless of its publish state.
  sanityClient().fetch<ArticleDoc | null>(
    `*[_id == $id][0]{
      _id, _rev, title, description, byline, content, slug,
      syntheticVoice, syntheticVoiceEnabled, audioContentHash,
      "audioGenerationResult": audioGenerationResult{status, updatedAt},
      "pendingAudioVersions": audioVersions[status == "pending"]{contentHash, generatedAt},
      publishDate,
      "heading": heading->{"segment": slugSegment, "template": slugTemplate}
    }`,
    { id: documentId },
    { perspective: 'raw' },
  )

// Cheap idempotency check for the Huebsch webhook: an already-recorded
// audioContentHash matching the one this specific delivery is for means a
// prior delivery of the *same* generation's result already handled it —
// webhook providers commonly retry a delivery (at-least-once semantics, or
// simply not seeing our ack fast enough), and nothing about a retried
// delivery's signed query params changes, so it looks like a perfectly
// valid, brand-new request. Checked before doing any of the (wasteful, and
// non-idempotent on their own) S3/asset upload work below.
export const fetchAudioContentHash = (documentId: string) =>
  // `raw` for the same reason as fetchArticle above — documentId is very
  // often a `drafts.*` id, and the default (published) perspective returns
  // null for one even on an exact _id match.
  sanityClient().fetch<string | undefined>(
    `*[_id == $id][0].audioContentHash`,
    { id: documentId },
    { perspective: 'raw' },
  )

// Mirrors studio's own STALE_AFTER_MS (functions/sync-audio/index.ts) — the
// longest a legitimate generation + Huebsch webhook delivery can take. A
// claim older than this must belong to a run that was abandoned (backend
// unreachable, Huebsch's webhook lost, ...), not one still genuinely in
// flight — without this, a lost run would block every future generation
// for this article forever.
const IN_PROGRESS_STALE_AFTER_MS = 72 * 60 * 60 * 1000

// The actual duplicate-generation guard: a generation is only a duplicate of
// *this* request if one is already pending for the exact same content hash.
// A different hash (the article changed since the other one was kicked off)
// is a legitimate, independent generation and must be allowed to proceed —
// a blanket "anything pending at all" check (this replaces the old
// document-level isAudioGenerationInProgress) would otherwise block it
// forever.
export const hasPendingVersion = (
  pending: { contentHash?: string; generatedAt?: string }[] | undefined,
  contentHash: string,
): boolean =>
  Boolean(
    pending?.some((v) => {
      if (v.contentHash !== contentHash) return false
      if (!v.generatedAt) return true
      const generatedAt = Date.parse(v.generatedAt)
      return (
        Number.isNaN(generatedAt) ||
        Date.now() - generatedAt < IN_PROGRESS_STALE_AFTER_MS
      )
    }),
  )

// Atomically claims this content hash's generation slot, guarded by the
// revision this request read the article at, and inserts a "pending"
// placeholder into audioVersions in the same commit so it's visible in
// Studio's history the moment the claim lands. sync-audio's own
// ifRevisionId claim (functions/sync-audio/index.ts) only protects against
// two invocations racing for the *same* revision — it does nothing to stop
// a burst of rapid saves each spawning their own invocation, each targeting
// a *different*, newer revision, each independently winning its own claim
// and calling this endpoint (confirmed in practice: 13 separate
// /webhooks/sanity/generate-audio requests within ~2 seconds for one
// article, each passing every check up to this point and firing its own
// Huebsch generation). This is a second, independent claim at the layer
// that actually talks to Huebsch, so a burst of trigger requests for the
// same content can only ever result in one real generation: if the document
// changed since this handler read it — e.g. a sibling request's own claim
// already landed — the commit is rejected (409) rather than racing ahead.
export const claimAudioGeneration = async (
  documentId: string,
  rev: string,
  contentHash: string,
): Promise<boolean> => {
  try {
    await sanityClient()
      .patch(documentId)
      .ifRevisionId(rev)
      .setIfMissing({ audioVersions: [] })
      .insert('after', 'audioVersions[-1]', [
        {
          _type: 'audioVersion',
          status: 'pending',
          contentHash,
          generatedAt: new Date().toISOString(),
        },
      ])
      .set({
        audioGenerationResult: {
          status: 'in-progress',
          updatedAt: new Date().toISOString(),
        },
      })
      .commit({ autoGenerateArrayKeys: true })
    return true
  } catch (error) {
    if ((error as { statusCode?: number } | null)?.statusCode === 409) {
      return false
    }
    throw error
  }
}

// Turns the placeholder a claim inserted into a visible failure record
// instead of silently discarding it, once it's clear that specific attempt
// isn't going to finish (buildSpeakableContent throwing, the Huebsch
// upload/request itself failing, or Huebsch reporting a failed generation on
// its webhook callback) — an editor looking at the history should be able to
// tell which attempt failed and why, not just see it vanish. Only the
// status/error sub-fields are patched, so contentHash/generatedAt survive
// untouched — "since when this attempt was running" stays visible.
export const markPendingVersionError = (
  documentId: string,
  contentHash: string,
  error: unknown,
) => {
  const path = `audioVersions[contentHash == "${contentHash}" && status == "pending"]`
  return sanityClient()
    .patch(documentId)
    .set({
      [`${path}.status`]: 'error',
      [`${path}.error`]: errorMessage(error),
    })
    .commit({ autoGenerateArrayKeys: true })
}

// Looks up the _key of the pending placeholder a given contentHash's
// generation was claimed under, so the Huebsch webhook can replace it in
// place (see recordAudioVersion) instead of appending a duplicate entry.
// `raw` for the same reason as fetchArticle/fetchAudioContentHash above —
// documentId is very often a drafts.* id.
export const fetchPendingVersionKey = (documentId: string, contentHash: string) =>
  sanityClient().fetch<string | undefined>(
    `*[_id == $id][0].audioVersions[status == "pending" && contentHash == $hash][0]._key`,
    { id: documentId, hash: contentHash },
    { perspective: 'raw' },
  )

export interface AudioVersionChapter {
  _key: string
  name: string
  at: number
}

export interface AudioVersion {
  file: { _type: 'file'; asset: { _type: 'reference'; _ref: string } }
  url: string
  durationMs?: number
  generatedAt: string
  // Only present when ENABLE_CHAPTER_MARKERS is on and Huebsch resolved
  // chapters for this generation.
  chapters?: AudioVersionChapter[]
}

// Sets the "current" audio fields (read by the frontend) and records this
// generation in `audioVersions` (the full history, browsable/restorable in
// Studio) in the same commit, so the two never drift out of sync.
//
// When `pendingKey` identifies the placeholder claimAudioGeneration inserted
// for this run, the finished entry replaces it in place (same _key) rather
// than being appended — the replacement object has no `status`/`contentHash`
// fields, so it reads exactly like every other finished entry once written.
// Falls back to appending when no matching placeholder exists (a generation
// kicked off before this placeholder mechanism existed, or one whose
// placeholder was already cleaned up by removePendingVersion).
export const recordAudioVersion = (
  documentId: string,
  currentFields: Record<string, unknown>,
  version: AudioVersion,
  pendingKey: string | undefined,
) => {
  const patch = sanityClient().patch(documentId).set(currentFields)
  if (pendingKey) {
    patch.set({ [`audioVersions[_key == "${pendingKey}"]`]: version })
  } else {
    patch.setIfMissing({ audioVersions: [] }).append('audioVersions', [version])
  }
  return patch.commit({ autoGenerateArrayKeys: true })
}

export const uploadAudioAsset = (buffer: Buffer, filename: string) =>
  sanityClient().assets.upload('file', buffer, {
    filename,
    contentType: 'audio/mpeg',
  })

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

// Surfaces a failed generation (our own validation, the Huebsch request, or
// processing its callback) on the article itself, so an editor sees it in
// Studio instead of it only showing up in server logs.
export const reportAudioGenerationError = async (
  documentId: string,
  error: unknown,
) => {
  logger.error({ error }, `audio generation failed for ${documentId}`)
  try {
    await sanityClient()
      .patch(documentId)
      .set({
        audioGenerationResult: {
          status: 'error',
          updatedAt: new Date().toISOString(),
          error: errorMessage(error),
        },
      })
      .commit({ autoGenerateArrayKeys: true })
  } catch (e) {
    logger.error(
      { error: e },
      `failed to report audio generation error for ${documentId}`,
    )
  }
}

export const reportAudioGenerationSuccess = (documentId: string) =>
  sanityClient()
    .patch(documentId)
    .set({
      audioGenerationResult: {
        status: 'success',
        updatedAt: new Date().toISOString(),
      },
    })
    .commit({ autoGenerateArrayKeys: true })
