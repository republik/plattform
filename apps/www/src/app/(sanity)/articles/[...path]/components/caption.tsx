import { css, cx } from '@republik/theme/css'
import { PortableText, PortableTextProps } from 'next-sanity'

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

const captionSizeStyles = {
  FULL: css({
    pl: '4',
  }),
}

export function Caption({
  caption = {},
  size = 'NORMAL',
  className,
}: {
  caption?: {
    legend?: PortableTextProps<any>
    credit?: PortableTextProps<any>
  }
  size?: string
  className?: string
}) {
  const { legend, credit } = caption

  if (!legend && !credit) return null
  return (
    (legend || credit) && (
      <figcaption
        className={cx(legendStyle, className, captionSizeStyles[size])}
      >
        <PortableText value={legend} />
        {credit && (
          <span className={creditStyle}>
            <PortableText value={credit} />
          </span>
        )}
      </figcaption>
    )
  )
}
