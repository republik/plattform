'use client'

import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { Heading } from '@/app/(sanity)/components/teaser/feed/heading'
import { Button } from '@/app/components/ui/button'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { useTranslation } from '@/lib/withT'
import { IconArrowRight } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

// Same resolution as LinkOverlay, which can't expose it: article/page teasers
// carry a slug, standalone teaser documents an arbitrary href.
function teaserHref(teaser: TeaserListItemType): string | undefined {
  const href =
    teaser._type === 'teaserSmall' ? stegaClean(teaser.href) : teaser.slug
  return href ?? undefined
}

export function BookmarkedFeed({ teasers }: { teasers: TeaserListItemType[] }) {
  if (!teasers.length) return null

  return (
    <EventTrackingContext category='NextReads:BookmarkedFeed'>
      <BookmarkedGrid teasers={teasers} />
    </EventTrackingContext>
  )
}

function BookmarkedGrid({ teasers }: { teasers: TeaserListItemType[] }) {
  const { t } = useTranslation()

  const [first, ...rest] = teasers

  return (
    <div
      data-theme='light'
      className={cx(
        nextReadsSection,
        css({ background: 'background.marketing', color: 'text' }),
      )}
    >
      <div className={nextReadHeader}>
        <h3>{t('nextReads/bookmarkedFeed/title')}</h3>
        <p className='tagline'>{t('nextReads/bookmarkedFeed/subtitle')}</p>
      </div>
      <div
        className={css({
          px: '15px',
          pb: 8,
          md: { pb: 16 },
        })}
      >
        <FirstBookmarkItem teaser={first} numberOfTeasers={teasers.length} />
        <BookmarkItems teasers={rest} />
        <Button
          asChild
          className={css({ mt: 8, md: { mt: 16 } })}
          variant='outline'
        >
          <Link href='/lesezeichen'>
            {t('nextReads/bookmarkedFeed/manageBookmarks')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

const BookmarkItems = ({ teasers }: { teasers: TeaserListItemType[] }) => {
  if (!teasers.length) return null

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        mt: 8,
        gap: 8,
        width: '100%',
        md: {
          margin: '0 auto',
          pt: 6,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '975px',
        },
      })}
    >
      {teasers.map((teaser) => (
        <BookmarkItem key={teaser._id} teaser={teaser} />
      ))}
    </div>
  )
}

const FirstBookmarkItem = ({
  teaser,
  numberOfTeasers,
}: {
  teaser: TeaserListItemType
  numberOfTeasers: number
}) => {
  const { t } = useTranslation()
  const href = teaserHref(teaser)

  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          mx: 'auto',
          mt: 4,
          mb: 12,
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          maxWidth: '642px',
          position: 'relative', // for the link overlay placement
          md: {
            mb: 6,
          },
        }),
      )}
    >
      <h4>
        <span className={css({ fontSize: 24, md: { fontSize: 32 } })}>
          <LinkOverlay teaser={teaser} />
        </span>
      </h4>
      <TeaserImage
        image={teaser.image}
        alt=''
        width={650}
        height={488}
        sizes='(max-width: 640px) 100vw, 650px'
        className={css({
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '3/4',
          objectFit: 'cover',
          md: {
            aspectRatio: '4/3',
            maxWidth: '650px',
          },
        })}
      />
      {hasContent(teaser.byline) && (
        <p className='author'>
          <InlinePortableText value={teaser.byline} />
        </p>
      )}
      {/* TODO: reading duration. The legacy feed showed
          `estimatedReadingMinutes`/`estimatedConsumptionMinutes`, which
          TEASER_SMALL_FRAGMENT does not project. `audioDurationMs` is the only
          duration available and covers audio only, so it is not a substitute. */}
      {hasContent(teaser.description) && (
        <p
          className={css({
            fontFamily: 'rubis',
            fontSize: 18,
            lineHeight: 1.8,
            textAlign: 'left',
          })}
        >
          <InlinePortableText value={teaser.description} />
        </p>
      )}
      {href && (
        <Link
          href={href}
          className={css({
            alignSelf: numberOfTeasers <= 1 ? 'flex-start' : undefined,
            justifySelf: 'center',
          })}
        >
          {t('nextReads/bookmarkedFeed/readMore')} <IconArrowRight size={20} />
        </Link>
      )}
    </div>
  )
}

const BookmarkItem = ({ teaser }: { teaser: TeaserListItemType }) => {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          gap: 4,
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          maxWidth: '420px',
          width: '100%',
          margin: '0 auto',
          textAlign: 'left',
          position: 'relative', // for the link overlay placement
          md: {
            display: 'flex',
            flex: 1,
            maxWidth: '312px',
            flexDirection: 'column-reverse',
            justifyContent: 'flex-start',
            width: 'auto',
            margin: 0,
          },
        }),
      )}
    >
      <div>
        <Heading teaser={teaser} />
        <h4>
          <LinkOverlay teaser={teaser} />
        </h4>
        {/* TODO: reading duration — see FirstBookmarkItem. */}
      </div>
      <TeaserImage
        image={teaser.image}
        alt=''
        width={624}
        height={624}
        sizes='312px'
        className={css({ width: '312px', maxWidth: '100%' })}
      />
    </div>
  )
}
