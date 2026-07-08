import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { SanityImageAssetReference } from '@/sanity.types'
import { getImageDimensions } from '@sanity/asset-utils'
import { Image, type ImageProps } from 'next-sanity/image'

export function FrontTeaserImage({
  asset,
  ...imageProps
}: { asset: SanityImageAssetReference | undefined | null } & Omit<
  ImageProps,
  'src' | 'width' | 'height'
>) {
  if (!asset) {
    return '[ BILD EINFÜGEN ]'
  }

  const src = urlFor(asset).url()
  const dimensions = getImageDimensions(src)

  return (
    <Image
      src={src}
      width={dimensions.width}
      height={dimensions.height}
      {...imageProps}
    />
  )
}
