import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
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
  width: '248px',
  display: 'flex',
  flexShrink: 0,
  flexDirection: 'column',
  // fall back to no background / inherited text color when the teaser
  // doesn't define custom colors
  backgroundColor: 'var(--teaser-bg, transparent)',
  color: 'var(--teaser-color, inherit)',
  border: '1px solid',
  borderColor: 'divider',
  // a custom background replaces the border
  '&[data-has-background]': {
    border: 'none',
  },
})

export function CarouselTeaser({ teaser }: { teaser: TeaserListItemType }) {
  const backgroundColor = stegaClean(teaser.backgroundColor?.hex)
  const color = stegaClean(teaser.color?.hex)

  return (
    <div
      style={{ opacity: upcomingTeaser(teaser) ? 0.5 : 1 }}
      className={css({
        scrollSnapAlign: 'start',
        scrollSnapMarginLeft: '15px',
        display: 'flex',
        '&:first-child': { ml: 'auto' },
        '&:last-child': { mr: 'auto' },
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
        <TeaserImage image={teaser.image} alt='' width={248} />
        <div
          className={css({
            px: '3',
            py: '6',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '2',
          })}
        >
          <Heading teaser={teaser} />
          <h4 className='editorial'>
            <LinkOverlay teaser={teaser} />
          </h4>
          {teaser.description && (
            <p className='description'>
              <InlinePortableText value={teaser.description} />
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
