import { type Caption } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'
import { PortableText } from 'next-sanity'

const legendStyle = css({
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
  _before: {
    content: '" "',
  },
  md: {
    fontSize: '0.75rem',
  },
})

const ptComponents = {
  block: { normal: ({ children }) => <>{children}</> },
}

export function Caption({
  caption,
  id,
  className,
}: {
  caption: Caption
  id?: string
  className?: string
}) {
  const { legend, credit } = caption

  if (!legend && !credit) return null
  return (
    (legend || credit) && (
      <figcaption id={id} className={cx(legendStyle, className)}>
        <PortableText components={ptComponents} value={legend} />
        {credit && (
          <span className={creditStyle}>
            <PortableText components={ptComponents} value={credit} />
          </span>
        )}
      </figcaption>
    )
  )
}
