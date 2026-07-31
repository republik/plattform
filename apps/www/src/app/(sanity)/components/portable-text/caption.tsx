import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { type Caption } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'

const legendStyle = css({
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
        <InlinePortableText value={legend} />
        {credit && (
          <span className={creditStyle}>
            <InlinePortableText value={credit} />
          </span>
        )}
      </figcaption>
    )
  )
}
