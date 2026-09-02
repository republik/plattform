// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// `_sanityAsset: 'image@<url>'` markers (produced by mdastToPortableText.ts,
// following studio's own migration-tool convention — see
// studio/import/publikator/src/assetRefs.ts) are only understood by
// `@sanity/import`: the dataset-import CLI/library used for the one-time
// bulk migration scans for that key, fetches the URL, uploads it, and
// rewrites it into a real asset reference *before* handing documents to the
// import endpoint. The regular content API this worker writes through
// (`createOrReplace`/`transaction().commit()` via `@sanity/client`) does not
// resolve it — a document written with a literal `_sanityAsset` field would
// just store that string as data, not become an image. This module does the
// same fetch-and-upload step ourselves, so it must run on every built
// document before it's written.
import { logger } from '@orbiting/backend-modules-logger'
import { sanityClient } from '../client'

const ASSET_MARKER_RE = /^(?:file|image)@(https?:\/\/.+)$/

// Fetch+upload each unique `image@<url>` marker in the tree once, then
// rewrite every object holding a `_sanityAsset` key in place: the marker is
// replaced with `asset: {_type: 'reference', _ref: <uploaded id>}`,
// matching Sanity's image object shape. Uploads are deduped by URL within
// one call (Sanity itself also dedupes server-side by asset content hash,
// per the studio importer's own README).
export async function resolveAssetMarkers<T>(doc: T): Promise<T> {
  const uploads = new Map<string, Promise<string | undefined>>()

  const uploadOnce = (url: string): Promise<string | undefined> => {
    let promise = uploads.get(url)
    if (!promise) {
      promise = uploadImageAsset(url)
      uploads.set(url, promise)
    }
    return promise
  }

  await walk(doc, uploadOnce)
  return doc
}

async function walk(
  node: unknown,
  uploadOnce: (url: string) => Promise<string | undefined>,
): Promise<void> {
  if (Array.isArray(node)) {
    await Promise.all(node.map((item) => walk(item, uploadOnce)))
    return
  }
  if (!node || typeof node !== 'object') return

  const obj = node as Record<string, unknown>
  const marker = obj._sanityAsset
  if (typeof marker === 'string') {
    delete obj._sanityAsset
    const match = ASSET_MARKER_RE.exec(marker)
    if (match) {
      const assetId = await uploadOnce(match[1])
      if (assetId) {
        obj.asset = { _type: 'reference', _ref: assetId }
      }
    }
  }

  await Promise.all(Object.values(obj).map((value) => walk(value, uploadOnce)))
}

async function uploadImageAsset(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetch failed with status ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = url.split('/').pop()?.split('?')[0]
    const asset = await sanityClient().assets.upload('image', buffer, {
      filename,
    })
    return asset._id
  } catch (error) {
    // Don't fail the whole sync over one broken/unreachable image — the
    // article still becomes readable/editable in Studio, just missing this
    // one image. Logged through the shared structured logger (not
    // console.error) so a systemic failure (e.g. a misconfigured
    // SANITY_API_TOKEN) is actually visible/searchable/alertable rather than
    // silently sitting in raw stdout while every sync still reports success.
    logger.error({ error, url }, 'sanity sync: failed to upload image asset')
    return undefined
  }
}
