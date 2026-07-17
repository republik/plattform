import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import type { SanityImageSource } from '@sanity/image-url'
import { Image, type ImageProps } from 'next-sanity/image'

export function SquareTeaserImage({
  image,
  size,
  ...imageProps
}: { image: SanityImageSource | undefined | null; size: number } & Omit<
  ImageProps,
  'src' | 'width' | 'height'
>) {
  if (!image) {
    return (
      <div
        className={css({
          color: 'overlay',
          bg: 'overlay',
          width: 'full',
          minWidth: '100px',
          aspectRatio: '1 / 1',
          display: 'grid',
          placeContent: 'center',
        })}
      ></div>
    )
  }

  // If an image with crop/hotspot is provided, those will be applied automatically
  console.log({ image })
  const src = urlFor(image).width(size).height(size).url()

  return <Image src={src} width={size} height={size} {...imageProps} />
}
