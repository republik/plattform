import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { SquareTeaserImage } from '@/app/(sanity)/components/teaser/_shared/square-teaser-image'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { css, cx } from '@republik/theme/css'

const carouselItemStyle = css({
  cursor: 'pointer',
  position: 'relative',
  m: '2',
  width: '248px',
  display: 'flex',
  flexShrink: 0,
  flexDirection: 'column',
  border: '1px solid',
  borderColor: 'divider',
})

export function CarouselTeaser({ teaser }: { teaser: TeaserFragmentType }) {
  return (
    <div
      className={css({
        scrollSnapAlign: 'start',
        scrollSnapMarginLeft: '15px',
        display: 'flex',
        '&:first-child': { ml: 'auto' },
        '&:last-child': { mr: 'auto' },
      })}
    >
      <div className={cx(typography, carouselItemStyle)}>
        <SquareTeaserImage image={teaser.image} alt='' size={248} />
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
