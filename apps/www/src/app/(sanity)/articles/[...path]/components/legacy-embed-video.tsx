import { linkStyle } from '@/app/(sanity)/articles/[...path]/styles'
import type { EmbedVideo } from '@/sanity.types'
import { css, cva } from '@republik/theme/css'
import Link from 'next/link'

const containerStyle = cva({
  base: {},
  variants: {
    size: {
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
      },
    },
  },
})

// TODO: use some full-featured player library like video.js for HLS streaming/subtitle support etc.

export function LegacyEmbedVideo({ value }: { value: EmbedVideo }) {
  try {
    const { src, size, aspectRatio } = value
    return (
      <div className={containerStyle({ size })}>
        {src?.mp4 ? (
          <video
            src={src.mp4}
            className={css({
              width: 'full',
              objectFit: 'contain',
            })}
            style={{ aspectRatio: aspectRatio ?? '16 /9' }}
            controls
            playsInline
          />
        ) : typeof src === 'string' ? (
          <Link className={linkStyle} href={src} target='_blank' rel='noopener'>
            {src}
          </Link>
        ) : null}
      </div>
    )
  } catch (e) {
    console.error('Video data could not be parsed', e)
  }
  return null
}
