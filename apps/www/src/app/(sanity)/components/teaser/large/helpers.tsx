import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import type {
  SanityImageDimensions,
  SanityImageSource,
} from '@sanity/image-url'
import { Image, type ImageProps } from 'next-sanity/image'

export function TeaserLargeImage({
  image,
  ...imageProps
}: { image: SanityImageSource | undefined | null } & Omit<
  ImageProps,
  'src' | 'width' | 'height'
>) {
  const Placeholder = (
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

  if (!image) {
    return Placeholder
  }

  // If an image with crop/hotspot is provided, those will be applied automatically
  let src: string
  let dimensions: SanityImageDimensions
  try {
    src = urlFor(image).url()
    dimensions = getImageDimensions(src)
  } catch (e) {
    src = ''
    console.error(e)
    return Placeholder
  }

  return (
    <Image
      src={src}
      width={dimensions.width}
      height={dimensions.height}
      {...imageProps}
    />
  )
}
