import { editorialWidth } from '@/app/(sanity)/articles/[...path]/styles'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
// import type { EditorialImage as EditorialImageType } from '@/sanity/__generated__/types'
import { css, cx } from '@republik/theme/css'
import { Caption } from './caption'

const figure = css({
  mb: '15px',
})

const sizeStyles = {
  NORMAL: css({
    ...editorialWidth,
  }),
  LARGE: css({
    ...editorialWidth,
    maxWidth: 'large',
  }),
  FULL: css({
    width: '100%',
  }),
  // we don't use FULL for GROUP images because edge-to-edge also
  // has an influence on the caption's styles (which we don't want)
  GROUP: css({
    width: '100%',
  }),
}

const image = css({
  display: 'block',
  width: '100%',
  height: 'auto',
})

export function EditorialImage({ value }) {
  const { image: img, imageDark, alt, legend, credit, size = 'NORMAL' } = value

  if (!img?.asset) return null

  const src = urlFor(img).auto('format').url()
  const darkSrc = imageDark?.asset
    ? urlFor(imageDark).auto('format').url()
    : undefined

  return (
    <figure className={cx(sizeStyles[size], figure)}>
      {darkSrc ? (
        <picture>
          <source srcSet={darkSrc} media='(prefers-color-scheme: dark)' />
          <img className={image} src={src} alt={alt ?? ''} />
        </picture>
      ) : (
        <img className={image} src={src} alt={alt ?? ''} />
      )}
      <Caption legend={legend} credit={credit} size={size} />
    </figure>
  )
}
