import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { IconArrowRight } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { Document } from '../../../graphql/republik-api/__generated__/gql/graphql'
import { SquareCover } from '../assets/SquareCover'
import { Button } from '../ui/button'
import { CategoryLabel, getAuthors, NextReadLink } from './helpers'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

export function BookmarkedFeed({ documents }: { documents: Document[] }) {
  return (
    <EventTrackingContext category='NextReads:BookmarkedFeed'>
      <BookmarkedGrid documents={documents} />
    </EventTrackingContext>
  )
}

function BookmarkedGrid({ documents }: { documents: Document[] }) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div
      data-theme='light'
      className={cx(
        nextReadsSection,
        css({ background: 'background.marketing', color: 'text' }),
      )}
    >
      <div className={nextReadHeader}>
        <h3>Gemerkte Beiträge</h3>
        <p className='tagline'>Deine Leseliste</p>
      </div>
      <div
        className={css({
          px: '15px',
          pb: 8,
          md: { pb: 16 },
        })}
      >
        <FirstBookmarkItem
          document={documents[0]}
          numberOfDocuments={documents.length}
        />
        <BookmarkItems documents={documents.slice(1)} />
        <Link href='/lesezeichen'>
          <Button className={css({ mt: 8, md: { mt: 16 } })} variant='outline'>
            Lesezeichen verwalten
          </Button>
        </Link>
      </div>
    </div>
  )
}

const BookmarkItems = ({ documents }: { documents: Document[] }) => {
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
      {documents.map((document, index) => (
        <BookmarkItem key={document.id} document={document} index={index + 1} />
      ))}
    </div>
  )
}

const FirstBookmarkItem = ({
  document,
  numberOfDocuments,
}: {
  document: Document
  numberOfDocuments: number
}) => {
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
          <NextReadLink document={document} index={0} />
        </span>
      </h4>
      {document.meta.image && (
        <img
          src={`${document.meta.image}&resize=1300x`}
          alt={`Cover for ${document.meta.title}`}
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
      )}
      <p className='author'>{getAuthors(document.meta.contributors)}</p>
      <p className='duration'>{document.meta.estimatedReadingMinutes} min</p>
      <p
        className={css({
          fontFamily: 'rubis',
          fontSize: 18,
          lineHeight: 1.8,
          textAlign: 'left',
        })}
      >
        {document.meta.description}
      </p>
      <Link
        href={document.meta.path}
        className={css({
          alignSelf: numberOfDocuments < 1 && 'flex-start',
          justifySelf: 'center',
        })}
      >
        Weiterlesen <IconArrowRight size={20} />
      </Link>
    </div>
  )
}

const BookmarkItem = ({
  document,
  index,
}: {
  document: Document
  index: number
}) => {
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
            direction: 'column-reverse',
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
        <CategoryLabel document={document} />
        <h4>
          <NextReadLink document={document} index={index} />
        </h4>
        <p className='duration'>
          {document.meta.estimatedReadingMinutes ||
            document.meta.estimatedConsumptionMinutes}{' '}
          min
        </p>
      </div>
      <SquareCover
        size={312}
        title={document.meta.title}
        cover={document.meta.audioCover}
        crop={document.meta.audioCoverCrop}
        image={document.meta.image}
      />
    </div>
  )
}
