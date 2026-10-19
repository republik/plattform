import { assetCdnBaseUrl } from '@/app/(sanity)/lib/env'

const SANITY_CDN_ORIGIN = 'https://cdn.sanity.io'

// Rewrites a Sanity CDN asset URL stored as a plain string (e.g. an mp3 file
// URL) to the asset CDN. Other URLs are returned unchanged.
export function toAssetCdnUrl(
  src: string | null | undefined,
): string | undefined {
  if (!src) {
    return undefined
  }
  if (!assetCdnBaseUrl) {
    return src
  }

  try {
    const url = new URL(src)
    if (url.origin !== SANITY_CDN_ORIGIN) {
      return src
    }
    const base = new URL(assetCdnBaseUrl)
    url.protocol = base.protocol
    url.host = base.host
    return url.toString()
  } catch {
    return src
  }
}
