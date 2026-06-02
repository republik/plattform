import { editorialWidthAttrs } from '@/app/(sanity)/articles/[...path]/styles'
import { css, cx } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import { AsideImage } from './aside-image'

const quoteStyle = css({
  textStyle: 'serifBold',
  fontSize: '3xl',
})

const sourceStyle = css({
  textStyle: 'sans',
  fontSize: 's',
})

export function PullQuote({ value }) {
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
        css({ ...editorialWidthAttrs, margin: '30px auto' }),
        hasImage &&
          css({
            display: 'grid',
            gridTemplateColumns: '155px 1fr',
            gap: '4',
          }),
      )}
      style={{
        textAlign:
          stegaClean(size) === 'narrow' && !hasImage ? 'center' : undefined,
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
