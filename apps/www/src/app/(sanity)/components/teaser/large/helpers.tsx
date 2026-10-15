import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
import type {
  SanityImageDimensions,
  SanityImageSource,
} from '@sanity/image-url'
import { stegaClean } from 'next-sanity'
import { Image, type ImageProps } from 'next-sanity/image'

function ImagePlaceholder(props: { 'data-sanity'?: string }) {
  return (
    <div
      data-sanity={props['data-sanity']}
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

export function TeaserLargeImage({
  image,
  ...imageProps
}: { image: SanityImageSource | undefined | null } & Omit<
  ImageProps,
  'src' | 'width' | 'height'
>) {
  // If an image with crop/hotspot is provided, those will be applied automatically
  let src: string
  let dimensions: SanityImageDimensions
  try {
    src = urlFor(image).url()
    dimensions = getImageDimensions(src)
  } catch (e) {
    console.warn(e)
    return <ImagePlaceholder {...imageProps} />
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

export function Heading({ heading }: { heading: { title: string } }) {
  return (
    <p
      className={css({
        fontFamily: 'gtAmericaStandard',
        fontWeight: 500,
        fontSize: { base: 'base', md: 'l' },
        lineHeight: 1,
        position: 'relative', // place above link overlay
      })}
    >
      {stegaClean(heading.title)}
    </p>
  )
}
