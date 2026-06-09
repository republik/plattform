import { Caption } from '@/app/(sanity)/articles/[...path]/components/caption'
import { EditorialImage } from '@/app/(sanity)/articles/[...path]/components/editorial-image'
import { css, cx } from '@republik/theme/css'

const sizeStyles = {
  NARROW: css({
    maxWidth: 'narrow',
  }),
  NORMAL: css({}),
  LARGE: css({
    maxWidth: 'large',
  }),
}

const groupStyle = css({
  margin: 0,
  padding: 0,

  position: 'relative',
  md: {
    display: 'grid',
    gap: '4',
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
  const { images = [], caption, size = 'NORMAL' } = value

  if (!images.length) return null

  return (
    <figure
      role='group'
      className={cx(sizeStyles[size], groupStyle)}
      style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}
    >
      {images.map((img) => {
        // we don't use size: FULL for GROUP images since FULL also adds
        // padding to the caption (which we don't want here)
        return (
          <EditorialImage value={{ ...img, size: 'GROUP' }} key={img._key} />
        )
      })}
      {caption && <Caption caption={caption} className={groupCaptionStyle} />}
    </figure>
  )
}
