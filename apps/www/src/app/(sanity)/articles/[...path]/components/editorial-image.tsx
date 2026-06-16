import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { EditorialImage } from '@/sanity.types'
import { css, cva } from '@republik/theme/css'
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

const image = css({
  display: 'block',
  width: '100%',
  height: 'auto',
})

export function EditorialImage({ value }: { value: EditorialImage }) {
  const captionId = useId()
  const { asset, imageDark, alt, caption, size } = value

  if (!asset) return null

  const src = urlFor(asset).auto('format').url()
  const darkSrc = imageDark?.asset
    ? urlFor(imageDark).auto('format').url()
    : undefined

  return (
    <figure
      className={figureStyle({ size })}
      // role=group signals the grouping to legacy screen readers and browsers that don't understand the <figure> semantics
      role='group'
      aria-labelledby={captionId}
    >
      {darkSrc ? (
        <picture>
          <source srcSet={darkSrc} media='(prefers-color-scheme: dark)' />
          <img className={image} src={src} alt={alt ?? ''} />
        </picture>
      ) : (
        <img className={image} src={src} alt={alt ?? ''} />
      )}
      {caption && <Caption id={captionId} caption={caption} />}
    </figure>
  )
}
