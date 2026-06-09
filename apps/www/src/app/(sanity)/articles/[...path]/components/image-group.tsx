import { Caption } from '@/app/(sanity)/articles/[...path]/components/caption'
import { EditorialImage } from '@/app/(sanity)/articles/[...path]/components/editorial-image'
import { cva } from '@republik/theme/css'
import { useId } from 'react'

const figureGroupStyle = cva({
  base: {
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
      NARROW: {
        maxWidth: 'narrow',
        mx: 'auto',
      },
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
        '& > figcaption': {
          ml: '4',
        },
      },
    },
  },
})

const imageGridStyle = cva({
  base: {
    display: 'grid',
    gap: '4',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },

  variants: {
    size: {
      NARROW: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      },
    },
  },
})

export function ImageGroup({ value }) {
  const captionId = useId()
  const { images = [], caption, size } = value

  if (!images.length) return null

  return (
    <figure
      role='group'
      aria-labelledby={captionId}
      className={figureGroupStyle({ size })}
    >
      <div className={imageGridStyle({ size })}>
        {images.map((img) => {
          // remove size of grouped images, which would mess up their position in the image grid
          return (
            <EditorialImage value={{ ...img, size: null }} key={img._key} />
          )
        })}
      </div>
      {caption && <Caption id={captionId} caption={caption} />}
    </figure>
  )
}
