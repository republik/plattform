import { Caption } from '@/app/(sanity)/articles/[...path]/components/caption'
import { editorialWidthAttrs } from '@/app/(sanity)/articles/[...path]/styles'
import { css } from '@republik/theme/css'
import { PortableText } from 'next-sanity'

const containerStyle = css({
  ...editorialWidthAttrs,
  backgroundColor: 'hover',
  margin: '30px auto',
  md: {
    margin: '40px auto',
  },
  _first: {
    marginTop: 0,
  },
  _last: {
    marginBottom: 0,
  },
})

const quoteParagraph = css({
  margin: 0,
  padding: '0 15px 12px 15px',
  fontFamily: 'gtAmericaStandard',
  fontSize: '0.9375rem',
  lineHeight: 1.4,
  color: 'text',
  _first: {
    paddingTop: '12px',
  },
  md: {
    fontSize: '1.125rem',
    lineHeight: 1.5,
    padding: '0 25px 20px 25px',
    _first: {
      paddingTop: '20px',
    },
  },
})

export function BlockQuote({ value }) {
  const { body, caption } = value

  return (
    <>
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
    </>
  )
}
