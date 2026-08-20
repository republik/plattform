import { urlFor } from '@/app/(sanity)/lib/urlFor'

export type CoverImageSource = {
  asset?: unknown
  imageDark?: { asset?: unknown }
} | null

export type AudioCoverImages = {
  cover?: string
  coverDark?: string
}

/**
 * Resolves an article's audio-cover image following the same fallback chain
 * as the old per-format cover: the article's compact-teaser image, else its
 * own cover, else its featured collection's image (the "Kolumne"/"Briefing"
 * equivalent) — and builds one square light/dark crop, reused at every size
 * the audio player renders at (40/62/90px). 180px is small enough that a
 * separate crop per size isn't worth it — the smaller slots just downscale it.
 */
export function getAudioCoverImages(source: {
  teaserSmallImage?: CoverImageSource
  cover?: CoverImageSource
  collectionImage?: CoverImageSource
}): AudioCoverImages {
  const sourceImage: CoverImageSource =
    (source.teaserSmallImage?.asset && source.teaserSmallImage) ||
    (source.cover?.asset && source.cover) ||
    (source.collectionImage?.asset && source.collectionImage) ||
    undefined
  if (!sourceImage?.asset) return {}
  return {
    cover: urlFor(sourceImage).width(180).height(180).url(),
    coverDark: sourceImage.imageDark?.asset
      ? urlFor(sourceImage.imageDark).width(180).height(180).url()
      : undefined,
  }
}
