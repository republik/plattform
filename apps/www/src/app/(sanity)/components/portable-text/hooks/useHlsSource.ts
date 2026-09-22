'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Wires an HLS source onto a <video> or <audio> element: native playback on
 * Safari/iOS (which report canPlayType truthy for HLS), hls.js everywhere
 * else, and a fallback to `fallbackUrl` (e.g. mp4) if the native attempt
 * actually fails — canPlayType is only a heuristic, not a guarantee.
 *
 * Shared between the video block's <video> player and the audio block's
 * <audio> player for Vimeo-hosted sources — the same technique works for
 * either tag.
 */
export function useHlsSource(
  mediaRef: RefObject<HTMLMediaElement | null>,
  hlsUrl: string | undefined,
  fallbackUrl: string | undefined,
) {
  useEffect(() => {
    const media = mediaRef.current
    if (!media || !hlsUrl) {
      return
    }

    if (media.canPlayType('application/vnd.apple.mpegurl')) {
      const handleError = () => {
        if (fallbackUrl) {
          media.removeAttribute('src')
          media.load()
        }
      }
      media.addEventListener('error', handleError)
      media.src = hlsUrl
      return () => media.removeEventListener('error', handleError)
    }

    let hls: import('hls.js').default | undefined
    let cancelled = false

    import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) {
        return
      }
      hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(media)
    })

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [mediaRef, hlsUrl, fallbackUrl])
}
