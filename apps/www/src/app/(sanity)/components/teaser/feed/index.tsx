import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { css, cx } from '@republik/theme/css'

export default function FeedTeaser({ teaser }: { teaser: TeaserListItemType }) {
  if (!teaser) return null

  return (
    <div
      style={{ opacity: upcomingTeaser(teaser) ? 0.5 : 1 }}
      className={cx(
        typography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <Heading teaser={teaser} />
      {/* standalone teaser documents carry no theme */}
      <h4
        className={
          ('theme' in teaser ? teaser.theme?.name : undefined) !== 'EDITORIAL'
            ? 'meta'
            : ''
        }
      >
        <LinkOverlay teaser={teaser} />
      </h4>
      <p className='description'>
        <InlinePortableText value={teaser.description} />
      </p>
      <p className='byline'>
        <InlinePortableText value={teaser.byline} />
      </p>
    </div>
  )
}
