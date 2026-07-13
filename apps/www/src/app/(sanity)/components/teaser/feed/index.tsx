import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { css, cx } from '@republik/theme/css'

export default function FeedTeaser({ teaser }: { teaser: TeaserFragmentType }) {
  return (
    <div
      className={cx(
        typography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <Heading teaser={teaser} />
      <h4 className={teaser.theme?.name !== 'EDITORIAL' ? 'meta' : ''}>
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
