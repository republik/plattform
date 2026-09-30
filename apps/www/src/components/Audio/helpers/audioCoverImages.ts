import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import {
  AUDIO_COVER_FALLBACK_PATH,
  CDN_FRONTEND_BASE_URL,
} from '@/lib/constants'

// Absolute, unlike the in-page fallback: the native app's lock screen and the
// browser's Media Session both need a URL they can fetch on their own.
const AUDIO_COVER_FALLBACK_URL = `${CDN_FRONTEND_BASE_URL}${AUDIO_COVER_FALLBACK_PATH}`

/**
 * A square cover URL for the places that need a plain string rather than an
 * element: the native app's lock-screen artwork and the browser's Media
 * Session metadata. In the UI itself the image is rendered by `TeaserImage`
 * straight from the Sanity image object, so no URL is built by hand there.
 */
export function audioCoverUrl(
  image: AudioQueueItemContent['image'],
  size: number,
): string {
  if (!image?.asset) {
    return AUDIO_COVER_FALLBACK_URL
  }
  try {
    return urlFor(image).width(size).height(size).url()
  } catch (e) {
    console.warn(e)
    return AUDIO_COVER_FALLBACK_URL
  }
}
