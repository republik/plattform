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
import logo from '@republik/theme/logo.json'
import { stegaClean } from 'next-sanity'
import Link from '@/app/components/ui/link'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

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
      <TeaserDuration teaser={teaser} />
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
            // Without this, a long title's min-content width beats the
            // flex-basis of 0 and that item ends up wider than its siblings.
            minWidth: 0,
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
        <TeaserDuration teaser={teaser} />
      </div>
      <TeaserCover teaser={teaser} size={312} />
    </div>
  )
}

function TeaserDuration({ teaser }: { teaser: TeaserListItemType }) {
  const durationMs = teaser.audioDurationMs

  if (!durationMs) return null

  return <p className='duration'>{Math.round(durationMs / 60_000)} min</p>
}

function TeaserCover({
  teaser,
  size,
}: {
  teaser: TeaserListItemType
  size: number
}) {
  return (
    <div
      className={css({
        aspectRatio: '1 / 1',
        width: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}
      style={{ maxWidth: size }}
    >
      {teaser.image?.asset ? (
        <TeaserImage
          image={teaser.image}
          alt=''
          width={size}
          height={size}
          className={css({ width: '100%', height: '100%', objectFit: 'cover' })}
        />
      ) : (
        <div
          className={css({
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
          })}
        >
          <svg
            viewBox={logo.BRAND_MARK_VIEWBOX}
            role='presentation'
            className={css({ width: '40%', fill: '#fff' })}
          >
            <path d={logo.BRAND_MARK_PATH} />
          </svg>
        </div>
      )}
    </div>
  )
}
