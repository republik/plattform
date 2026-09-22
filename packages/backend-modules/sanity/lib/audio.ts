import { logger } from '@orbiting/backend-modules-logger'
import { sanityClient } from './client'
import { draftIdFor, publishedIdFor } from './document'
import { ReleaseNotMutableError, withReleaseUnlock } from './releaseLock'

// True when a mutation was rejected because its target document doesn't
// exist — distinct from a lock rejection (see releaseLock.ts), and not
// something withReleaseUnlock can catch on its own: it only knows a release
// isn't locked, not that the specific document inside it is already gone.
// That happens when a release promotes (publish) or gets unscheduled/deleted
// while generation was still in flight — by the time Huebsch's webhook lands,
// `versions.<release>.<id>` may simply no longer exist.
function isDocumentNotFoundError(err: unknown): boolean {
  const items = (
    err as { details?: { items?: { error?: { type?: string } }[] } } | null
  )?.details?.items
  return Boolean(items?.some((item) => item.error?.type === 'documentNotFoundError'))
}

// True for either way a versioned document can turn out to be unwritable by
// the time we get to it: it's gone outright (isDocumentNotFoundError), or
// its release moved into a state withReleaseUnlock has no recovery path for
// (any ReleaseNotMutableError — see releaseLock.ts). A `published` release
// gets its own, more specific recovery in withDraftSync below (its content
// merged into a real, mutable published document); this covers the rest
// (archived, or a genuinely vanished document), where falling back to the
// draft is the only option.
function isUnrecoverableVersionError(err: unknown): boolean {
  return isDocumentNotFoundError(err) || err instanceof ReleaseNotMutableError
}

// Every write in this file goes through this: locked-release handling (via
// withReleaseUnlock) against documentId, plus keeping the draft permanently
// up to date with the same write. Editors are almost always looking at the
// draft in Studio, not the scheduled/published version — so whenever
// documentId isn't already the draft itself, the same patch is also mirrored
// onto draftIdFor(documentId) once the primary write succeeds. That mirror
// write is best-effort: it's never allowed to fail the caller, since the
// primary write (the one actually gating claim/success/error semantics)
// already landed.
//
// TTS generation is async and can take real time, and the release backing
// `documentId` can move on while it's in flight. Two different things can
// have happened by the time any of these run:
//   - The release already PUBLISHED: its version content already merged
//     into the real published document (a normal, mutable, non-versioned
//     doc) — that's the live target now, not a vanished one. Patch it
//     directly (making this generation the article's current audio version,
//     same as if it had finished before publish), then still mirror onto
//     the draft below, same as the ordinary success path — both the
//     published document and the draft must end up with this write.
//   - Anything else unrecoverable (archived, or the document genuinely gone
//     because a schedule was cancelled/deleted): there's no live document to
//     redirect to, so fall back to the draft (always still there) and log
//     loudly — this needs a human to notice and reconcile from the draft's
//     history.
// `doPatch` receives the id to target, so it can be applied to documentId,
// the published id, the draft, or a combination.
async function withDraftSync<T>(
  documentId: string,
  action: string,
  doPatch: (id: string) => Promise<T>,
): Promise<T> {
  const draftId = draftIdFor(documentId)
  const isVersioned = draftId !== documentId

  let result: T
  try {
    result = await withReleaseUnlock(sanityClient(), documentId, () =>
      doPatch(documentId),
    )
  } catch (err) {
    if (err instanceof ReleaseNotMutableError && err.state === 'published') {
      const publishedId = publishedIdFor(documentId)
      try {
        result = await doPatch(publishedId)
        logger.error(
          { documentId, publishedId, err },
          `sanity audio: release already published when ${action} — ` +
            'patched the live published document instead',
        )
      } catch (publishErr) {
        logger.error(
          { documentId, publishedId, err: publishErr },
          `sanity audio: failed to patch the published document when ` +
            `${action} after its release published — falling back to the draft`,
        )
        return doPatch(draftId)
      }
      // Falls through to the draft-mirror step below, same as any other
      // successful primary write — both the published doc and the draft
      // must get this write, not one or the other.
    } else if (isUnrecoverableVersionError(err)) {
      logger.error(
        { documentId, draftId, err },
        `sanity audio: version document no longer writable when ${action} ` +
          '(release archived, or schedule cancelled while generation was ' +
          'in flight) — falling back to the draft',
      )
      return doPatch(draftId)
    } else {
      throw err
    }
  }

  if (isVersioned) {
    try {
      await doPatch(draftId)
    } catch (err) {
      logger.error(
        { documentId, draftId, err },
        `sanity audio: failed to mirror ${action} onto the draft (the ` +
          'scheduled/published write itself succeeded)',
      )
    }
  }

  return result
}

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
  // ifRevisionId only makes sense against documentId itself — rev was read
  // from that document, and would just always conflict (409) if reused
  // against the draft (whether mirrored or a not-found fallback), since the
  // draft's own revision has nothing to do with it. Omitted whenever id
  // isn't the original documentId.
  const doPatch = (id: string) => {
    let patch = sanityClient().patch(id)
    if (id === documentId) patch = patch.ifRevisionId(rev)
    return patch
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
  }

  try {
    await withDraftSync(documentId, 'claiming the generation slot', doPatch)
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
  const doPatch = (id: string) =>
    sanityClient()
      .patch(id)
      .set({
        [`${path}.status`]: 'error',
        [`${path}.error`]: errorMessage(error),
      })
      .commit({ autoGenerateArrayKeys: true })
  return withDraftSync(
    documentId,
    'marking a pending generation as failed',
    doPatch,
  )
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
// The finished entry replaces claimAudioGeneration's placeholder in place
// (same _key) rather than being appended — the replacement object has no
// `status`/`contentHash` fields, so it reads exactly like every other
// finished entry once written. Falls back to appending when no matching
// placeholder exists (a generation kicked off before this placeholder
// mechanism existed, or one whose placeholder was already cleaned up).
//
// Since withDraftSync now mirrors this write onto the draft in addition to
// documentId, the placeholder's _key isn't shared between the two documents
// (each claim inserted its own placeholder, independently, into each) — so
// the matching key is looked up per target id here, rather than once by the
// caller for documentId alone.
export const recordAudioVersion = (
  documentId: string,
  currentFields: Record<string, unknown>,
  version: AudioVersion,
  contentHash: string,
) => {
  const doPatch = async (id: string) => {
    const pendingKey = await fetchPendingVersionKey(id, contentHash)
    const patch = sanityClient().patch(id).set(currentFields)
    if (pendingKey) {
      patch.set({ [`audioVersions[_key == "${pendingKey}"]`]: version })
    } else {
      patch.setIfMissing({ audioVersions: [] }).append('audioVersions', [version])
    }
    return patch.commit({ autoGenerateArrayKeys: true })
  }
  return withDraftSync(documentId, 'recording generated audio', doPatch)
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
  const doPatch = (id: string) =>
    sanityClient()
      .patch(id)
      .set({
        audioGenerationResult: {
          status: 'error',
          updatedAt: new Date().toISOString(),
          error: errorMessage(error),
        },
      })
      .commit({ autoGenerateArrayKeys: true })
  try {
    await withDraftSync(documentId, 'reporting a generation error', doPatch)
  } catch (e) {
    logger.error(
      { error: e },
      `failed to report audio generation error for ${documentId}`,
    )
  }
}

export const reportAudioGenerationSuccess = (documentId: string) => {
  const doPatch = (id: string) =>
    sanityClient()
      .patch(id)
      .set({
        audioGenerationResult: {
          status: 'success',
          updatedAt: new Date().toISOString(),
        },
      })
      .commit({ autoGenerateArrayKeys: true })
  return withDraftSync(documentId, 'reporting a successful generation', doPatch)
}
