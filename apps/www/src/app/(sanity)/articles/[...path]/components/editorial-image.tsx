import { editorialWidth } from '@/app/(sanity)/articles/[...path]/styles'
import { urlFor } from '@/app/(sanity)/lib/urlFor' // import type { EditorialImage as EditorialImageType } from '@/sanity/__generated__/types'
import { css } from '@republik/theme/css'

const sizeStyles = {
  NORMAL: css({
    ...editorialWidth,
  }),
  LARGE: css({
    md: {
      width: 'large',
      mx: 'auto',
    },
  }),
  FULL: css({
    width: '100%',
  }),
}

const image = css({
  display: 'block',
  width: '100%',
  height: 'auto',
})

const legendStyle = css({
  margin: '5px auto 0 auto',
  width: '100%',
  fontFamily: 'gtAmericaStandard',
  fontSize: '0.75rem',
  lineHeight: '1.2',
  color: 'text',
  md: {
    fontSize: '0.9375rem',
  },
})

const creditStyle = css({
  fontSize: '0.625rem',
  '&::before': {
    content: '" "',
  },
  md: {
    fontSize: '0.75rem',
  },
})

export function EditorialImage({ value }) {
  const { image: img, imageDark, alt, legend, credit, size = 'NORMAL' } = value

  if (!img?.asset) return null

  const src = urlFor(img).auto('format').url()
  const darkSrc = imageDark?.asset
    ? urlFor(imageDark).auto('format').url()
    : undefined

  return (
    <figure className={sizeStyles[size]}>
      {darkSrc ? (
        <picture>
          <source srcSet={darkSrc} media='(prefers-color-scheme: dark)' />
          <img className={image} src={src} alt={alt ?? ''} />
        </picture>
      ) : (
        <img className={image} src={src} alt={alt ?? ''} />
      )}
      {(legend || credit) && (
        <figcaption className={legendStyle}>
          {legend}
          {credit && <span className={creditStyle}>{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
