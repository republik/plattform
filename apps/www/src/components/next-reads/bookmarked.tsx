import { SquareCover } from '@app/components/assets/SquareCover'
import { CategoryLabel, getAuthors } from '@app/components/next-reads/helpers'
import { Button } from '@app/components/ui/button'
import { IconArrowRight } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import React from 'react'
import { Document } from '../../../graphql/republik-api/__generated__/gql/graphql'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

export function BookmarkedFeed({ documents }: { documents: Document[] }) {
  return (
    <div
      className={cx(
        nextReadsSection,
        css({ background: 'background.marketing' }),
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
          <Button
            className={css({ mt: '36px', md: { mt: '48px' } })}
            variant='outline'
          >
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
      {documents.map((document) => (
        <BookmarkItem key={document.id} document={document} />
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
          margin: '16px auto 24px auto',
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          maxWidth: '642px',
        }),
      )}
    >
      <h4>
        <span className={css({ fontSize: 24, md: { fontSize: 32 } })}>
          {document.meta.title}
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
      <p className='duration'>
        {document.meta.estimatedReadingMinutes} Minuten
      </p>
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

const BookmarkItem = ({ document }: { document: Document }) => {
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
          md: {
            display: 'flex',
            direction: 'column-reverse',
            maxWidth: '309px',
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
        <h4>{document.meta.title}</h4>
        <p className='duration'>
          {document.meta.estimatedReadingMinutes ||
            document.meta.estimatedConsumptionMinutes}{' '}
          Minuten
        </p>
      </div>
      <div className={css({ width: '100%' })}>
        <SquareCover
          size={1024}
          title={document.meta.title}
          cover={document.meta.audioCover}
          crop={document.meta.audioCoverCrop}
          image={document.meta.image}
        />
      </div>
    </div>
  )
}
