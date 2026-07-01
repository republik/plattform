import { Caption } from '@/app/(sanity)/components/portable-text/caption'
import { css } from '@republik/theme/css'
import { PortableText, PortableTextReactComponents } from 'next-sanity'
import { ReactNode } from 'react'

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

const ptComponents: Partial<PortableTextReactComponents> = {
  block: {
    normal({ children }: { children?: ReactNode }) {
      return <p className={quoteParagraph}>{children}</p>
    },
  },
}

// TODO: quid list support??

export function BlockQuote({ value }) {
  const { body, caption } = value

  return (
    <div className={css({})}>
      <div className={containerStyle}>
        <PortableText value={body} components={ptComponents} />
      </div>
      {caption && <Caption caption={caption} />}
    </div>
  )
}
