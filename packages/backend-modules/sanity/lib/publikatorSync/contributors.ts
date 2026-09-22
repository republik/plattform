// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// `_sanityContributor: {userId, title}` markers (attached by
// mdastToPortableText.ts alongside a *deterministic* `_ref`) flag a
// contributor reference whose target document might not actually exist at
// that id: the deterministic id assumes the contributor doc was produced by
// the one-time migration's own uuidV5(userId) scheme, but a profile created
// directly in Sanity Studio gets a random `_id` instead (its `userId` field
// is only used for later lookups like this one, never as the doc id). This
// module resolves each marker against Sanity by `userId` first, falling back
// to creating a minimal stub at the deterministic id only when no matching
// contributor exists anywhere — mirrors assets.ts's marker-resolve-rewrite
// shape (dedup cache, best-effort per marker, never fails the whole doc).
import { logger } from '@orbiting/backend-modules-logger'
import { sanityClient } from '../client'
import { contributorToSanityUUID, ContributorRefMarker } from './mdastToPortableText'

const MARKER_KEY = '_sanityContributor'

export async function resolveContributorRefs<T>(doc: T): Promise<T> {
  const cache = new Map<string, Promise<string>>()

  const resolveOnce = (userId: string, title?: string): Promise<string> => {
    let promise = cache.get(userId)
    if (!promise) {
      promise = resolveContributorId(userId, title)
      cache.set(userId, promise)
    }
    return promise
  }

  await walk(doc, resolveOnce)
  return doc
}

async function walk(
  node: unknown,
  resolveOnce: (userId: string, title?: string) => Promise<string>,
): Promise<void> {
  if (Array.isArray(node)) {
    await Promise.all(node.map((item) => walk(item, resolveOnce)))
    return
  }
  if (!node || typeof node !== 'object') return

  const obj = node as Record<string, unknown>
  const marker = obj[MARKER_KEY] as ContributorRefMarker | undefined
  if (marker && typeof marker === 'object' && typeof marker.userId === 'string') {
    delete obj[MARKER_KEY]
    obj._ref = await resolveOnce(marker.userId, marker.title)
  }

  await Promise.all(Object.values(obj).map((value) => walk(value, resolveOnce)))
}

// Look the contributor up by its `userId` field first — this is the only
// way to find a Studio-created profile, whose `_id` was never derived from
// the userId. Only falls back to (idempotently) creating a stub at the
// deterministic id when no such document exists anywhere yet.
async function resolveContributorId(
  userId: string,
  title: string | undefined,
): Promise<string> {
  const deterministicId = contributorToSanityUUID(userId)
  try {
    const existingId = await sanityClient().fetch<string | null>(
      `*[_type == "contributor" && userId == $userId][0]._id`,
      { userId },
    )
    if (existingId) return existingId

    await sanityClient().createIfNotExists({
      _id: deterministicId,
      _type: 'contributor',
      userId,
      ...(title ? { title } : {}),
    })
  } catch (error) {
    // Best-effort, same reasoning as assets.ts's uploadImageAsset: a
    // transient Sanity hiccup here must never fail the whole sync, and
    // falling back to the deterministic id never regresses below today's
    // behavior (it's exactly what every contributor ref already resolved to
    // before this lookup/create step existed).
    logger.warn(
      { error, userId },
      'sanity sync: contributor lookup/create failed, using deterministic id',
    )
  }
  return deterministicId
}
