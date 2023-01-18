import Image, { ImageProps } from 'next/image'
import assetServerImageLoader from './assetServerImageLoader'

/**
 * AssetImage is a wrapper around the Next.js Image component
 * that uses the asssets-server image-loader.
 */
const AssetImage = (props: Omit<ImageProps, 'loader'>) => (
  <Image {...props} loader={assetServerImageLoader} />
)

export default AssetImage
