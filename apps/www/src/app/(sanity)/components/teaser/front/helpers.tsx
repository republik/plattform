import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { SanityImageAssetReference } from '@/sanity.types'
import { css } from '@republik/theme/css'
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
    return (
      <div
        className={css({
          color: 'overlay',
          bg: 'overlay',
          width: 'full',
          minWidth: '100px',
          aspectRatio: '4 / 3',
          display: 'grid',
          placeContent: 'center',
        })}
      >
        Bild
      </div>
    )
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
