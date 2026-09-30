import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { AUDIO_COVER_FALLBACK_PATH } from '@/lib/constants'
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
  fallback,
  ...imageProps
}: {
  image: TeaserSmall['teaserSmallConfig']['image']
  width: number
  height: number
  // fallback: used for audio player and next reads bookmarks
  fallback?: boolean
} & Omit<ImageProps, 'src' | 'width' | 'height'>) {
  if (!image?.asset) {
    if (!fallback) {
      return null
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={cx(imageStyle(), imageProps.className)}
        style={imageProps.style}
        src={AUDIO_COVER_FALLBACK_PATH}
        alt=''
        width={width}
        height={height}
      />
    )
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
