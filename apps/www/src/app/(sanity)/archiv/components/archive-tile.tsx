import { ARCHIVE_IMAGE_SIZES } from '@/app/(sanity)/archiv/lib/mosaic'
import { TeaserLarge } from '@/app/(sanity)/components/teaser/large'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css } from '@republik/theme/css'

const tileStyle = css({
  position: 'relative',
  // Not inline-block: the line box's leading would widen the vertical gutter.
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
      <div data-archive-tile-inner>
        <TeaserLarge {...teaser} imageSizes={ARCHIVE_IMAGE_SIZES} />
      </div>
    </div>
  )
}
