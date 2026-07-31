import { Caption } from '@/app/(sanity)/components/portable-text/caption'
import { NestedPortableText } from '@/app/(sanity)/components/portable-text/render'
import { css } from '@republik/theme/css'

const containerStyle = css({
  backgroundColor: 'hover',
  py: '3',
  px: '4',
  md: {
    py: '5',
    px: '6',
  },

  '& > *': {
    fontFamily: 'gtAmericaStandard',
    fontSize: '0.9375rem',
    lineHeight: 1.4,
    pt: '3',
    md: {
      fontSize: '1.125rem',
      lineHeight: 1.5,
      pt: '4',
    },
    _first: {
      pt: 0,
    },
  },
})

export function BlockQuote({ value }) {
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
