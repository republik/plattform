import { useMemo } from 'react'
import Image, { ImageProps } from 'next/image'
import assetServerImageLoader from './assetServerImageLoader'
import { isDev } from '../constants'

/**
 * AssetImage is a wrapper around the Next.js Image component
 * that uses the asssets-server image-loader.
 */
const AssetImage = (props: Omit<ImageProps, 'loader'>) => {
  // Local static images that are not yet on the asset-server
  // can be loaded directly from the local file system while in development.
  const loadStaticFromLocal = useMemo(() => {
    if (
      isDev &&
      typeof props?.src === 'string' &&
      props.src.startsWith('/static')
    ) {
      return true
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
