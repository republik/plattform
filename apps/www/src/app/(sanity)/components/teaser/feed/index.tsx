import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserByline } from '@/app/(sanity)/components/teaser/_shared/teaser-byline'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { Heading } from '@/app/(sanity)/components/teaser/feed/heading'
import { TeaserActions } from '@/app/(sanity)/components/teaser/feed/teaser-actions'
import { css, cx } from '@republik/theme/css'

export default function FeedTeaser({
  teaser,
  skipPublishDate,
}: {
  teaser: TeaserListItemType
  skipPublishDate?: boolean
}) {
  if (!teaser) return null

  return (
    <div
      style={{ opacity: upcomingTeaser(teaser) ? 0.5 : 1 }}
      className={cx(
        typography,
        css({
          pb: 6,
          mb: 6,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <div
        className={css({ display: 'flex', flexDirection: 'column', gap: 2 })}
      >
        <Heading teaser={teaser} />
        <h4
          className={
            ['EDITORIAL', 'EDITORIAL_CENTERED'].includes(teaser.theme?.name)
              ? ''
              : 'meta'
          }
        >
          <LinkOverlay teaser={teaser} />
        </h4>
        {hasContent(teaser.description) && (
          <p className='description'>
            <InlinePortableText value={teaser.description} />
          </p>
        )}
        <TeaserByline teaser={teaser} skipPublishDate={skipPublishDate} />
      </div>
      <TeaserActions teaser={teaser} />
    </div>
  )
}
