import { urlFor } from '@/app/(sanity)/lib/urlFor'
// import type { EditorialImage as EditorialImageType } from '@/sanity/__generated__/types'
import { css, cx } from '@republik/theme/css'

const figure = css({
  margin: 0,
  marginBottom: '15px',
  padding: 0,
  width: '100%',
})

const sizeStyles = {
  NORMAL: css({}),
  LARGE: css({
    md: {
      marginLeft: '-155px',
      marginRight: '-155px',
      width: 'calc(100% + 310px)',
      maxWidth: 'none',
    },
  }),
  FULL: css({
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    width: '100vw',
    maxWidth: '100vw',
  }),
}

const image = css({
  display: 'block',
  width: '100%',
  height: 'auto',
})

const caption = css({
  margin: '5px auto 0 auto',
  width: '100%',
  fontFamily: 'gtAmericaStandard',
  fontSize: '12px',
  lineHeight: '15px',
  color: 'text',
  md: {
    fontSize: '15px',
    lineHeight: '18px',
  },
})

const creditStyle = css({
  '&::before': {
    content: '" "',
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
    <figure className={cx(figure, sizeStyles[size])}>
      {darkSrc ? (
        <picture>
          <source srcSet={darkSrc} media='(prefers-color-scheme: dark)' />
          <img className={image} src={src} alt={alt ?? ''} />
        </picture>
      ) : (
        <img className={image} src={src} alt={alt ?? ''} />
      )}
      {(legend || credit) && (
        <figcaption className={caption}>
          {legend}
          {credit && <span className={creditStyle}>{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
