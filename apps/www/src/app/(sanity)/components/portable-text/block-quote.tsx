import { Caption } from '@/app/(sanity)/components/portable-text/caption'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { css } from '@republik/theme/css'

const containerStyle = css({
  backgroundColor: 'hover',
  py: '3',
  px: '4',
  md: {
    py: '5',
    px: '6',
  },

  // Sizes follow the reader's font size setting — see `READER_FONT_SCALE` in the
  // theme package.
  '& > *': {
    fontFamily: 'gtAmericaStandard',
    fontSize: 'calc(0.9375rem * var(--article-font-scale, 1))',
    lineHeight: 1.4,
    pt: '3',
    md: {
      fontSize: 'calc(1.125rem * var(--article-font-scale, 1))',
      lineHeight: 1.5,
      pt: '4',
    },
    _first: {
      pt: 0,
    },
  },
})

export function BlockQuote({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'blockQuote' }>
}) {
  const { body, caption } = value

  return (
    <div className={css({})}>
      <div className={containerStyle}>
        <NestedPortableText value={body} />
      </div>
      {caption && <Caption caption={caption} />}
    </div>
  )
}
