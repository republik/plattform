import { RENDER_WIDTH } from '@/app/(sanity)/archiv/lib/mosaic'
import { TeaserLarge } from '@/app/(sanity)/components/teaser/large'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css } from '@republik/theme/css'

const tileStyle = css({
  position: 'relative',
  // Block rather than inline-block: an inline-block sits on a text baseline and
  // picks up the line box's leading, which would add a few stray pixels to the
  // vertical gutter only. `break-inside` keeps the column from splitting a tile,
  // which is what inline-block was otherwise buying us.
  display: 'block',
  breakInside: 'avoid',
  width: 'full',
  mb: '4',
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out',
  _hover: { transform: 'scale(0.97)', zIndex: 1 },
})

export function ArchiveTile({ teaser }: { teaser: TeaserLargeFragmentType }) {
  return (
    <div className={tileStyle} data-archive-tile>
      <div
        data-archive-tile-inner
        style={{ width: RENDER_WIDTH, transformOrigin: '0% 0%' }}
      >
        <TeaserLarge {...teaser} />
      </div>
    </div>
  )
}
