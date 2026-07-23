import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { timeFormat } from '@/lib/utils/format'
import { css, cx } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import type { CSSProperties } from 'react'

const carouselItemStyle = css({
  cursor: 'pointer',
  position: 'relative',
  m: '1',
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

  const noImage = stegaClean(imageStyle) === 'NONE'
  const smallImage = stegaClean(imageStyle) === 'SMALL'

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
        {!noImage && (
          <TeaserImage
            image={teaser.image}
            alt=''
            width={400}
            style={{
              width: smallImage ? '50%' : 'full',
              margin: smallImage ? '40px auto 0' : 0,
              height: 'auto',
            }}
          />
        )}
        <div
          style={{
            marginTop: noImage ? 'auto' : '0',
            marginBottom: noImage ? 'auto' : '0',
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
            <h5
              style={{
                color:
                  teaser.headingColor?.hex ??
                  teaser.theme?.accentColor?.hex ??
                  color,
              }}
            >
              {stegaClean(teaser.heading.title)}
            </h5>
          )}
          {skipDescription ? (
            <h3 className='editorial'>
              <LinkOverlay teaser={teaser} />
            </h3>
          ) : (
            <h4 className='editorial'>
              <LinkOverlay teaser={teaser} />
            </h4>
          )}
          {teaser.description && !skipDescription && (
            <p className='description'>
              <InlinePortableText value={teaser.description} />
            </p>
          )}

          {teaser._type !== 'page' && !skipDescription && (
            <p className='time'>
              {timeFormat('%d.%m.%Y')(new Date(teaser.publishDate))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
