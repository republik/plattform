import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/helpers'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { css, cx } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import type { CSSProperties } from 'react'

const carouselItemStyle = css({
  cursor: 'pointer',
  position: 'relative',
  m: '2',
  minHeight: '360px',
  width: 'full',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--teaser-bg, transparent)',
  color: 'var(--teaser-color, inherit)',
  border: '1px solid',
  borderColor: 'divider',
  '&[data-has-background]': {
    border: 'none',
  },
})

export function CarouselTeaser({
  teaser,
  imageStyle = 'NORMAL',
  skipDescription = false,
}: {
  teaser: TeaserListItemType
  imageStyle?: string
  skipDescription?: boolean
}) {
  const backgroundColor = stegaClean(teaser.backgroundColor?.hex)
  const color = stegaClean(teaser.color?.hex)

  return (
    <div
      style={{ opacity: upcomingTeaser(teaser) ? 0.5 : 1 }}
      className={css({
        scrollSnapAlign: 'start',
        scrollSnapMarginLeft: '15px',
        display: 'flex',
        flex: '1 0 248px',
        maxWidth: '400px',
      })}
    >
      <div
        className={cx(typography, carouselItemStyle)}
        data-has-background={backgroundColor ? '' : undefined}
        style={
          {
            ...(backgroundColor && { '--teaser-bg': backgroundColor }),
            ...(color && { '--teaser-color': color }),
          } as CSSProperties
        }
      >
        {imageStyle !== 'NONE' && (
          <TeaserImage
            image={teaser.image}
            alt=''
            width={400}
            style={{
              width: imageStyle === 'SMALL' ? '50%' : 'full',
              margin: imageStyle === 'SMALL' ? '40px auto 0' : 0,
              height: 'auto',
            }}
          />
        )}
        <div
          style={{
            marginTop: imageStyle === 'NONE' ? 'auto' : '0',
            marginBottom: imageStyle === 'NONE' ? 'auto' : '0',
          }}
          className={css({
            px: '6',
            py: '6',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          {teaser.heading && (
            <h5 style={{ color: teaser.headingColor?.hex ?? color }}>
              {stegaClean(teaser.heading.title)}
            </h5>
          )}
          <h4 className='editorial'>
            <LinkOverlay teaser={teaser} />
          </h4>
          {teaser.description && !skipDescription && (
            <p className='description'>
              <InlinePortableText value={teaser.description} />
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
