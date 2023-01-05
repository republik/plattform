import { ImageLoaderProps } from 'next/image'
import { CDN_FRONTEND_BASE_URL } from '../constants'

function assetServerImageLoader({
  src,
  width,
  quality = 75, // Quality is not yet supported by the assets-server
}: ImageLoaderProps): string {
  return `${CDN_FRONTEND_BASE_URL}${src}?resize=${width}x`
}

export default assetServerImageLoader
