import { urlFor } from '@/app/(sanity)/lib/urlFor'

export type CoverImageSource = {
  asset?: unknown
  imageDark?: { asset?: unknown }
} | null

export type AudioCoverImages = {
  coverSm?: string
  coverSmDark?: string
  coverMd?: string
  coverMdDark?: string
}

function squareCover(image: CoverImageSource, size: number) {
  if (!image?.asset) return undefined
  return {
    src: urlFor(image).width(size).height(size).url(),
    darkSrc: image.imageDark?.asset
      ? urlFor(image.imageDark).width(size).height(size).url()
      : undefined,
  }
}

/**
 * Resolves an article's audio-cover image following the same fallback chain
 * as the old per-format cover: the article's compact-teaser image, else its
 * own cover, else its featured collection's image (the "Kolumne"/"Briefing"
 * equivalent) — and builds square light/dark crops for the sizes the audio
 * player renders at (40/62px slots at `sm`, the 90px slot at `md`).
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
  const sm = squareCover(sourceImage, 124)
  const md = squareCover(sourceImage, 180)
  return {
    coverSm: sm?.src,
    coverSmDark: sm?.darkSrc,
    coverMd: md?.src,
    coverMdDark: md?.darkSrc,
  }
}
