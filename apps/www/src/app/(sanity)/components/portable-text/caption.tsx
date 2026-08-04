import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { type Caption } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'

// Sizes follow the reader's font size setting — see `READER_FONT_SCALE` in the
// theme package. Outside editorial content the `1` fallback applies.
const legendStyle = css({
  fontFamily: 'gtAmericaStandard',
  fontSize: 'calc(0.75rem * var(--article-font-scale, 1))',
  lineHeight: '1.2',
  color: 'text',
  md: {
    fontSize: 'calc(0.9375rem * var(--article-font-scale, 1))',
  },
})

const creditStyle = css({
  fontSize: 'calc(0.625rem * var(--article-font-scale, 1))',
  _before: {
    content: '" "',
  },
  md: {
    fontSize: 'calc(0.75rem * var(--article-font-scale, 1))',
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
