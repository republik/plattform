import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { EditorialImage, GroupedEditorialImage } from '@/sanity.types'
import { cva } from '@republik/theme/css'
import { getImageDimensions } from '@sanity/asset-utils'
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

const image = cva({
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

  const size = _type === 'editorialImage' ? value.size : undefined

  const isGrouped = _type === 'groupedEditorialImage'

  // Grouped images can scale to up to 280px each with 48px total gap and padding,
  // which makes them switch to a grid layout at 608px.
  // We could make more sophisticated calculations based on the size of the group
  // (to optimize image loading) but this media query gives us the best quality.
  const sizes = isGrouped ? '(max-width: 607px) 100vw, 50vw' : '100vw'

  if (!asset) {
    return null
  }

  const src = urlFor(asset).url()
  const dimensions = getImageDimensions(src)

  const darkSrc = imageDark?.asset ? urlFor(imageDark).url() : undefined
  const darkDimensions = darkSrc ? getImageDimensions(darkSrc) : undefined

  return (
    <figure
      className={figureStyle({ size })}
      // role=group signals the grouping to legacy screen readers and browsers that don't understand the <figure> semantics
      role='group'
      aria-labelledby={captionId}
    >
      {darkSrc ? (
        <picture>
          <Image
            className={image({ only: 'dark' })}
            src={darkSrc}
            alt={alt ?? ''}
            width={darkDimensions.width}
            height={darkDimensions.height}
            sizes={sizes}
          />
          <Image
            className={image({ only: 'light' })}
            src={src}
            alt={alt ?? ''}
            width={dimensions.width}
            height={dimensions.height}
            sizes={sizes}
          />
        </picture>
      ) : (
        <Image
          className={image()}
          src={src}
          alt={alt ?? ''}
          width={dimensions.width}
          height={dimensions.height}
          sizes={sizes}
        />
      )}
      {caption && <Caption id={captionId} caption={caption} />}
    </figure>
  )
}
