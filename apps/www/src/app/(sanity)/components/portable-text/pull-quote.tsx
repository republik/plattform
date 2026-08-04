import type { PullQuote } from '@/sanity.types'
import { css, cx } from '@republik/theme/css'
import { AsideImage } from './aside-image'

// Sizes follow the reader's font size setting — see `READER_FONT_SCALE` in the
// theme package.
const quoteStyle = css({
  textStyle: 'serifBold',
  fontSize: 'calc(token(fontSizes.3xl) * var(--article-font-scale, 1))',
})

const sourceStyle = css({
  textStyle: 'sans',
  fontSize: 'calc(token(fontSizes.s) * var(--article-font-scale, 1))',
})

export function PullQuote({ value }: { value: PullQuote }) {
  const { text, source, image, size } = value

  const hasImage = image?.asset

  /**
   * Note: pull quotes shouldn't be rendered as <blockquote> element
   * but <aside> instead.
   * see https://heydonworks.com/article/the-blockquote-element/
   */
  return (
    <aside
      className={cx(
        css({
          width: 'full',
          mt: '10',
          mb: '2',
          md: {
            mt: '12',
            mb: '4',
          },
        }),
        hasImage &&
          css({
            display: 'grid',
            gridTemplateColumns: '155px 1fr',
            gap: '4',
          }),
      )}
      style={{
        textAlign: size === 'narrow' && !hasImage ? 'center' : undefined,
      }}
    >
      {hasImage && <AsideImage image={image} width={155} />}
      <div>
        <p className={quoteStyle}>{text}</p>
        {source && <p className={sourceStyle}>{source}</p>}
      </div>
    </aside>
  )
}
