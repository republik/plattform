import { BlockQuoteContainer } from '@/app/(sanity)/components/portable-text/block-quote'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { css } from '@republik/theme/css'

type EmbedTwitterValue = Extract<
  ArticlePortableTextBlockType,
  { _type: 'embedTwitter' }
>

const creditStyle = css({
  fontFamily: 'gtAmericaStandard',
  fontSize: 'calc(0.75rem * var(--article-font-scale, 1))',
  lineHeight: '1.2',
  color: 'text',
  md: {
    fontSize: 'calc(0.9375rem * var(--article-font-scale, 1))',
  },
})

const urlStyle = css({
  textDecoration: 'underline',
  fontSize: 'calc(0.625rem * var(--article-font-scale, 1))',
  md: {
    fontSize: 'calc(0.75rem * var(--article-font-scale, 1))',
  },
})

export async function EmbedTwitter({ value }: { value: EmbedTwitterValue }) {
  const { text, url, userName } = value

  return (
    <div className={css({})}>
      <BlockQuoteContainer>
        <p>{text}</p>
      </BlockQuoteContainer>
      <figcaption>
        <span className={creditStyle}>{userName} </span>
        {url && (
          <a className={urlStyle} href={url} target='_blank'>
            {url}
          </a>
        )}
      </figcaption>
    </div>
  )
}
