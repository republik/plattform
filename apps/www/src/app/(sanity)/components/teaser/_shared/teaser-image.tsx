import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { TeaserSmall } from '@/sanity.types'
import { cva, cx } from '@republik/theme/css'
import { Image, type ImageProps } from 'next-sanity/image'

const imageStyle = cva({
  base: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  variants: {
    only: {
      dark: {
        _light: { display: 'none' },
      },
      light: {
        _dark: { display: 'none' },
      },
    },
  },
})

export function TeaserImage({
  image,
  width,
  height,
  ...imageProps
}: {
  image: TeaserSmall['image']
  width: number
  height: number
} & Omit<ImageProps, 'src' | 'width' | 'height'>) {
  if (!image?.asset) {
    return null
  }

  // If an image with crop/hotspot is provided, those will be applied automatically
  let src: string
  let darkSrc: string | undefined
  try {
    src = urlFor(image).width(width).height(height).url()

    if (image.imageDark) {
      darkSrc = urlFor(image.imageDark).width(width).height(height).url()
    }
  } catch (e) {
    console.warn(e)
    return null
  }

  if (darkSrc) {
    return (
      <>
        <Image
          {...imageProps}
          className={cx(imageStyle({ only: 'dark' }), imageProps.className)}
          src={darkSrc}
          alt={''}
          width={width}
          height={height}
        />
        <Image
          {...imageProps}
          className={cx(imageStyle({ only: 'light' }), imageProps.className)}
          src={src}
          alt={''}
          width={width}
          height={height}
        />
      </>
    )
  }

  return (
    <Image
      {...imageProps}
      className={cx(imageStyle(), imageProps.className)}
      src={src}
      alt={''}
      width={width}
      height={height}
    />
  )
}
