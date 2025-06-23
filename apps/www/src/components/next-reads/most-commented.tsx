import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { getAuthors } from '@app/components/next-reads/helpers'
import { nextReadHeader, nextReadItem } from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import React from 'react'

export const Cover3_4 = ({
  image: imageUrl,
  title,
}: {
  image?: string
  title: string
}) => {
  // TODO: fallback for missing image
  return (
    <div
      className={css({
        backgroundColor: 'pink',
        height: '867px',
        width: '650px',
      })}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`cover for ${title}`}
          width='650px'
          height='867px'
          style={{
            aspectRatio: '3/4',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  )
}

function RecommendedRead({ document }: { document: Document }) {
  return (
    <Link href={document.meta.path}>
      <div className={css({ position: 'relative' })}>
        <Cover3_4 title={document.meta.title} image={document.meta.image} />
        <div
          className={cx(
            nextReadItem,
            css({
              position: 'absolute',
              bottom: 16,
              width: '90%',
              left: '5%',
              textAlign: 'center',
              color: 'white',
            }),
          )}
        >
          <h4>
            <span className={css({ fontSize: 32 })}>{document.meta.title}</span>
          </h4>
          <p className='author'>{getAuthors(document)}</p>
        </div>
      </div>
    </Link>
  )
}

export function MostCommentedFeed({ documents }: { documents: Document[] }) {
  return (
    <div
      className={css({
        borderTop: '1px solid black',
      })}
    >
      <div
        className={cx(
          nextReadHeader,
          css({
            textAlign: 'center',
          }),
        )}
      >
        <h3>Was zu reden gibt</h3>
        <p className='tagline'>Die meistkommentierten Beiträge des Monats</p>
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'auto',
          gap: 1,
          px: 1,
          mb: 1,
          mt: 16,
          overflow: 'scroll',
        })}
      >
        {documents.map((document) => (
          <RecommendedRead key={document.id} document={document} />
        ))}
      </div>
    </div>
  )
}
