import { getAuthors } from '@app/components/next-reads/helpers'
import { Button } from '@app/components/ui/button'
import { createPageSchema } from '@project-r/styleguide'
import { IconArrowRight } from '@republik/icons'
import { renderMdast } from '@republik/mdast-react-render'
import { css, cx } from '@republik/theme/css'
import { splitByTitle } from 'lib/utils/mdast'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Document } from '../../../graphql/republik-api/__generated__/gql/graphql'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

export default function BookmarkedNextReadsFeed({
  documents,
}: {
  documents: Document[]
}) {
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
          pb: '24px',
          md: { pb: '80px' },
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

const BookmarkItems = ({ documents }: { documents: BookmarkDocument[] }) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        mt: '32px',
        gap: '32px',
        width: '100%',
        md: {
          margin: '0 auto',
          pt: '12px',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '975px',
          gap: '24px',
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
  const splitContent = document.content && splitByTitle(document.content)

  // Use page schema with container skipping to avoid white background
  const schema = createPageSchema({
    skipContainer: true,
    skipCenter: true,
  })

  const renderSchema = (content) => {
    return renderMdast(
      {
        ...content,
        format: undefined,
        section: undefined,
        series: undefined,
        repoId: document.repoId,
      },
      schema,
      { MissingNode: ({ children }) => children },
    )
  }

  return (
    <div
      className={css({
        margin: '16px auto 24px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        maxWidth: '642px',
        md: {
          pb: '40px',
        },
      })}
    >
      <h4
        className={css({
          fontFamily: 'rubis',
          fontSize: 24,
          lineHeight: 1.2,
          textAlign: 'center',
          md: {
            fontSize: 32,
          },
        })}
      >
        {document.meta.title}
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
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
        })}
      >
        <span>{getAuthors(document.meta.contributors)}</span>
        <span>{document.meta.estimatedReadingMinutes} min</span>
      </div>

      {splitContent?.mainTruncated && (
        <div
          className={css({
            fontFamily: 'rubis',
            fontSize: 18,
            lineHeight: 1.8,
            textAlign: 'left',
          })}
        >
          {renderSchema(splitContent.mainTruncated) as unknown as ReactNode}
          <Link
            href={document.meta.path}
            className={css({
              alignSelf: numberOfDocuments < 1 && 'flex-start',
            })}
          >
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                mt: '-16px',
              })}
            >
              Weiterlesen
              <IconArrowRight size={20} />
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

const BookmarkItem = ({ document }: { document: Document }) => {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          maxWidth: '420px',
          width: '100%',
          margin: '0 auto',
          md: {
            maxWidth: '309px',
            flexDirection: 'column-reverse',
            justifyContent: 'flex-start',
            width: 'auto',
            margin: 0,
          },
        }),
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        })}
      >
        <h4>{document.meta.title}</h4>
        <span>{document.meta.estimatedReadingMinutes} min Lesezeit</span>
      </div>
      {document.meta.image && (
        <img
          src={`${document.meta.image}&resize=618x`}
          alt={`Cover for ${document.meta.title}`}
          className={css({
            width: '100%',
            aspectRatio: '1',
            objectFit: 'cover',
            maxWidth: '112px',
            md: {
              maxWidth: '309px',
            },
          })}
        />
      )}
    </div>
  )
}
