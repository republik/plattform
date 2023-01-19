import Image, { ImageProps } from 'next/image'
import { isDev } from '../constants'
import assetServerImageLoader from './assetServerImageLoader'

type AsssetImageProps = Omit<ImageProps, 'loader'> & {
  // Omit loading the image via the asset-server.
  // Only works in dev-mode.
  // This is necessary when developing locally with images not yet on staging or production.
  loadLocally?: boolean
}

/**
 * AssetImage is a wrapper around the Next.js Image component
 * that uses the asssets-server image-loader.
 */
const AssetImage = ({ loadLocally, ...props }: AsssetImageProps) => (
  <Image
    {...props}
    loader={isDev && loadLocally ? undefined : assetServerImageLoader}
  />
)

export default AssetImage
