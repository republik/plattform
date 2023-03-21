import { useMemo } from 'react'
import Image, { ImageProps, StaticImageData } from 'next/image'
import assetServerImageLoader from './assetServerImageLoader'
import { isDev } from '../constants'

function isStaticImageData(src: ImageProps['src']): src is StaticImageData {
  return typeof src === 'object' && 'src' in src && typeof src.src === 'string'
}

/**
 * AssetImage is a wrapper around the Next.js Image component
 * that uses the asssets-server image-loader.
 */
const AssetImage = (props: Omit<ImageProps, 'loader'>) => {
  // Local static images that are not yet on the asset-server
  // can be loaded directly from the local file system while in development.
  const loadStaticFromLocal = useMemo(() => {
    if (isDev) {
      if (typeof props.src === 'string') {
        return props.src.startsWith('/')
      } else if (isStaticImageData(props.src)) {
        return props.src.src.startsWith('/')
      }
    }
    return false
  }, [isDev, props?.src])

  return (
    <Image
      {...props}
      loader={loadStaticFromLocal ? undefined : assetServerImageLoader}
    />
  )
}

export default AssetImage
