import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import type { SanityImageSource } from '@sanity/image-url'
import { Image, type ImageProps } from 'next-sanity/image'

export function FrontTeaserImage({
  image,
  ...imageProps
}: { image: SanityImageSource | undefined | null } & Omit<
  ImageProps,
  'src' | 'width' | 'height'
>) {
  console.log(image)
  if (!image) {
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

  const src = urlFor(image).url()
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
