import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { BylineShort } from '@/app/(sanity)/components/teaser/feed/helpers'
import { feedTeaserTypography } from '@/app/(sanity)/components/teaser/feed/styles'
import { FeedTeaserFragmentType } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { css, cx } from '@republik/theme/css'

export default function FeedTeaser({
  teaser,
}: {
  teaser: FeedTeaserFragmentType
}) {
  return (
    <div
      className={cx(
        feedTeaserTypography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <Heading teaser={teaser} />
      <h4>
        <LinkOverlay teaser={teaser} />
      </h4>
      <p className='description'>
        <InlinePortableText value={teaser.description} />
      </p>
      <BylineShort contributors={teaser.contributors} />
    </div>
  )
}
