import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css, cva } from '@republik/theme/css'
import { useId } from 'react'
import { Caption } from './caption'

const figureStyles = cva({
  base: {
    width: '100%',
    mb: '4',
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
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

export function EditorialImage({ value }) {
  const captionId = useId()
  const { image: img, imageDark, alt, caption, size } = value

  if (!img?.asset) return null

  const src = urlFor(img).auto('format').url()
  const darkSrc = imageDark?.asset
    ? urlFor(imageDark).auto('format').url()
    : undefined

  return (
    <figure
      className={figureStyles({ size })}
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
