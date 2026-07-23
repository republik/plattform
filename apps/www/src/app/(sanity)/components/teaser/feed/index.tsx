import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import {
  TeaserListItemType,
  upcomingTeaser,
} from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { Heading } from '@/app/(sanity)/components/teaser/feed/heading'
import { timeFormat } from '@/lib/utils/format'
import { css, cx } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import { Fragment } from 'react'

const formatDate = timeFormat('%d.%m.%Y')

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
          gap: 2,
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <Heading teaser={teaser} />
      <h4 className={teaser.theme?.name !== 'EDITORIAL' ? 'meta' : ''}>
        <LinkOverlay teaser={teaser} />
      </h4>
      {hasContent(teaser.description) && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
      {(hasContent(teaser.byline) || !skipPublishDate) && (
        <p className='byline'>
          {[
            hasContent(teaser.byline) && (
              <InlinePortableText key='byline' value={teaser.byline} />
            ),
            !skipPublishDate && teaser.publishDate && (
              <span key='date'>
                {formatDate(new Date(stegaClean(teaser.publishDate)))}
              </span>
            ),
          ]
            .filter(Boolean)
            .map((part, index) => (
              <Fragment key={index}>
                {index > 0 && ', '}
                {part}
              </Fragment>
            ))}
        </p>
      )}
    </div>
  )
}
