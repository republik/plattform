import { Caption } from '@/app/(sanity)/articles/[...path]/components/caption'
import { EditorialImage } from '@/app/(sanity)/articles/[...path]/components/editorial-image'
import { editorialWidth } from '@/app/(sanity)/articles/[...path]/styles'
import { css, cx } from '@republik/theme/css'

const sizeStyles = {
  NARROW: css({
    ...editorialWidth,
    maxWidth: 'narrow',
  }),
  NORMAL: css({
    ...editorialWidth,
  }),
  LARGE: css({
    ...editorialWidth,
    maxWidth: 'large',
  }),
}

const groupStyle = css({
  margin: 0,
  padding: 0,

  position: 'relative',
  md: {
    display: 'grid',
    gap: '15px',
  },
})

const groupCaptionStyle = css({
  marginBottom: '15px',
  marginTop: '-10px',
  md: {
    marginTop: '-25px',
    gridColumn: '1/-1',
  },
})

export function ImageGroup({ value }) {
  const { images = [], groupLegend, groupCredit, size = 'NORMAL' } = value

  if (!images.length) return null

  return (
    <figure
      role='group'
      className={cx(sizeStyles[size], groupStyle)}
      style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}
    >
      {images.map((img) => {
        return (
          <EditorialImage value={{ ...img, size: 'FULL' }} key={img._key} />
        )
      })}
      <Caption
        legend={groupLegend}
        credit={groupCredit}
        className={groupCaptionStyle}
      />
    </figure>
  )
}
