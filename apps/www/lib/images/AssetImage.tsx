import Image, { ImageProps } from 'next/image'
import assetServerImageLoader from './assetServerImageLoader'

/**
 * AssetImage is a wrapper around the Next.js Image component
 * that uses the asssets-server image loader by default.
 */
const AssetImage = ({ loader, ...props }: ImageProps) => (
  <Image {...props} loader={loader ?? assetServerImageLoader} />
)

export default AssetImage
