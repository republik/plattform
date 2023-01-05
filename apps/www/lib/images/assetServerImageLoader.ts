import { ImageLoaderProps } from 'next/image'
import { CDN_FRONTEND_BASE_URL, isDev } from '../constants'

function assetServerImageLoader({
  src,
  width,
  quality = 75, // Quality is not yet supported by the assets-server
}: ImageLoaderProps): string {
  if (!CDN_FRONTEND_BASE_URL) {
    if (isDev) {
      console.warn(
        'CDN_FRONTEND_BASE_URL is not set. Images will not be loaded from the asset-server.',
      )
    }
    return src
  }
  // Add asset-server prefix to relative URLs
  const url = new URL(
    !src.startsWith('http') ? CDN_FRONTEND_BASE_URL + src : src,
  )
  url.searchParams.set('resize', `${width}x`)
  url.searchParams.set('format', 'auto')

  return url.toString()
}

export default assetServerImageLoader
