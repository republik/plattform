import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { SanityImageSource } from '@sanity/image-url'

export const SOCIAL_IMAGE_WIDTH = 1200
export const SOCIAL_IMAGE_HEIGHT = 630

type SocialImageSource = {
  image?: SanityImageSource | null
  useImageBuilder?: boolean | null
}

type SocialImage = {
  url: string
  width: number
  height: number
}

/**
 * Resolves the share image of a document, used for both the Open Graph
 * metadata and the JSON-LD linked data.
 */
export function getSocialImage(
  data: SocialImageSource | null | undefined,
  slug: string,
): SocialImage | null {
  try {
    if (data?.useImageBuilder) {
      // Rendered "Share Image" (old style) generated on the fly by /api/og.
      return {
        url: new URL(
          `/api/og?slug=${encodeURIComponent(slug)}`,
          process.env.NEXT_PUBLIC_BASE_URL,
        ).toString(),
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
      }
    }

    if (data?.image) {
      // Static social image: point directly at the Sanity CDN crop.
      return {
        url: urlFor(data.image)
          .width(SOCIAL_IMAGE_WIDTH)
          .height(SOCIAL_IMAGE_HEIGHT)
          .url(),
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
      }
    }
  } catch (error) {
    console.error('Error generating image URL:', error)
  }

  return null
}
