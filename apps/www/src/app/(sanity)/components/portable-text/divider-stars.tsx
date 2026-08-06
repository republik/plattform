import { css } from '@republik/theme/css'

const dividerStarsStyle = css({
  textStyle: 'editorialParagraph',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 'calc(1.0625rem * var(--article-font-scale, 1))',
  md: {
    fontSize: 'calc(1.1875rem * var(--article-font-scale, 1))',
  },
  mt: '12',
  mb: '8',
  letterSpacing: '3',
})

export function DividerStars() {
  return <p className={dividerStarsStyle}>* * *</p>
}
