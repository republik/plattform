import { createImageUrlBuilder, SanityImageSource } from '@sanity/image-url'
import { assetCdnBaseUrl, dataset, projectId } from '@/app/(sanity)/lib/env'

const builder = createImageUrlBuilder({
  projectId,
  dataset,
  // Falls back to https://cdn.sanity.io when not set
  baseUrl: assetCdnBaseUrl,
})

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
