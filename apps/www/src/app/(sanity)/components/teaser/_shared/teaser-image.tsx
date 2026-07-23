import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { SanityImageSource } from '@sanity/image-url'
import { Image, type ImageProps } from 'next-sanity/image'

export function TeaserImage({
  image,
  width,
  height,
  ...imageProps
}: {
  image: SanityImageSource | undefined | null
  width: number
  height?: number
} & Omit<ImageProps, 'src' | 'width' | 'height'>) {
  if (!image) {
    return null
  }

  // If an image with crop/hotspot is provided, those will be applied automatically
  let src: string
  try {
    src = urlFor(image)
      .width(width)
      .height(height ?? width)
      .url()
  } catch (e) {
    console.error(e)
    return null
  }

  return (
    <Image src={src} width={width} height={height ?? width} {...imageProps} />
  )
}
