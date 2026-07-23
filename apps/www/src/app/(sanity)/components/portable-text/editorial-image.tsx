import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { EditorialImage, GroupedEditorialImage } from '@/sanity.types'
import { cva } from '@republik/theme/css'
import {
  getImageDimensions,
  type SanityImageDimensions,
} from '@sanity/asset-utils'
import { Image } from 'next-sanity/image'
import { useId } from 'react'
import { Caption } from './caption'

const figureStyle = cva({
  base: {
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
      TINY: {
        // TODO: migrate as token to panda, maybe?
        maxWidth: '325px',
        mx: 'auto',
        my: '4',
      },
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
        '& > figcaption': {
          ml: '4',
        },
      },
    },
  },
})

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

export function EditorialImage({
  value,
}: {
  value: EditorialImage | GroupedEditorialImage
}) {
  const captionId = useId()
  const { _type, asset, imageDark, alt, caption } = value

  if (!asset) {
    return null
  }

  const size = _type === 'editorialImage' ? value.size : undefined

  const isGrouped = _type === 'groupedEditorialImage'

  // Grouped images can scale to up to 280px each with 48px total gap and padding,
  // which makes them switch to a grid layout at 608px.
  // We could make more sophisticated calculations based on the size of the group
  // (to optimize image loading) but this media query gives us the best quality.
  const sizes = isGrouped ? '(max-width: 607px) 100vw, 50vw' : '100vw'

  let imageProps: { src: string; dimensions: SanityImageDimensions }
  let darkImageProps:
    | { src: string; dimensions: SanityImageDimensions }
    | undefined

  try {
    const src = urlFor(value).url()
    imageProps = {
      src,
      dimensions: getImageDimensions(src),
    }

    if (imageDark) {
      const darkSrc = urlFor(imageDark).url()
      darkImageProps = {
        src: darkSrc,
        dimensions: getImageDimensions(darkSrc),
      }
    }
  } catch (e) {
    console.warn(e)
    return null
  }

  return (
    <figure
      className={figureStyle({ size })}
      // role=group signals the grouping to legacy screen readers and browsers that don't understand the <figure> semantics
      role='group'
      aria-labelledby={captionId}
    >
      {darkImageProps ? (
        <>
          <Image
            className={imageStyle({ only: 'dark' })}
            src={darkImageProps.src}
            alt={alt ?? ''}
            width={darkImageProps.dimensions.width}
            height={darkImageProps.dimensions.height}
            sizes={sizes}
          />
          <Image
            className={imageStyle({ only: 'light' })}
            src={imageProps.src}
            alt={alt ?? ''}
            width={imageProps.dimensions.width}
            height={imageProps.dimensions.height}
            sizes={sizes}
          />
        </>
      ) : (
        <Image
          className={imageStyle()}
          src={imageProps.src}
          alt={alt ?? ''}
          width={imageProps.dimensions.width}
          height={imageProps.dimensions.height}
          sizes={sizes}
        />
      )}

      {caption && <Caption id={captionId} caption={caption} />}
    </figure>
  )
}
