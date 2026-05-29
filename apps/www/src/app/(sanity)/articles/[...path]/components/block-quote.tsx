import { Caption } from '@/app/(sanity)/articles/[...path]/components/caption'
import { editorialWidthAttrs } from '@/app/(sanity)/articles/[...path]/styles'
import { css } from '@republik/theme/css'
import { PortableText } from 'next-sanity'

const containerStyle = css({
  backgroundColor: 'hover',
  padding: '12px 15px',
  md: {
    padding: '20px 25px',
  },
})

const quoteParagraph = css({
  fontFamily: 'gtAmericaStandard',
  fontSize: '0.9375rem',
  lineHeight: 1.4,
  pb: '12px',
  md: {
    fontSize: '1.125rem',
    lineHeight: 1.5,
    pb: '20px',
  },
  _last: {
    pb: 0,
  },
})

function QuoteP({}) {}

// TODO: quid list support??

export function BlockQuote({ value }) {
  const { body, caption } = value

  return (
    <div className={css({ ...editorialWidthAttrs, margin: '30px auto' })}>
      <div className={containerStyle}>
        <PortableText
          value={body}
          components={{
            block: {
              normal: ({ children }) => (
                <p className={quoteParagraph}>{children}</p>
              ),
            },
          }}
        />
      </div>
      <Caption caption={caption} />
    </div>
  )
}
