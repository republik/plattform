import { useQuery } from '@apollo/client'
import {
  GetCollectionItemsDocument,
  ProgressState,
  GetCollectionItemsQuery,
} from '../../../graphql/republik-api/__generated__/gql/graphql'
import { css, cx } from '@republik/theme/css'
import { nextReadHeader } from './styles'
import Link from 'next/link'
import {
  ColorContextLocalExtension,
  useColorContext,
} from '@project-r/styleguide'
import { splitByTitle } from 'lib/utils/mdast'
import { ReactNode } from 'react'
import { renderMdast } from '@republik/mdast-react-render'
import { createPageSchema } from '@project-r/styleguide'
import { getAuthors } from '@app/components/next-reads/helpers'
import { IconArrowRight } from '@republik/icons'

type BookmarkDocument = NonNullable<
  GetCollectionItemsQuery['me']
>['collectionItems']['nodes'][number]['document']

const localColors = {
  light: { background: '#F2ECE6' },
  dark: { background: '#444546' },
}

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}

export default function BookmarkedNextReadsFeed() {
  const { data, loading } = useQuery(GetCollectionItemsDocument, {
    variables: {
      collections: ['bookmarks'],
      first: 10,
      lastDays: 300,
      progress: ProgressState.Unfinished,
    },
  })

  if (loading) return null

  const documents =
    data.me?.collectionItems.nodes.map((node) => node.document) || []

  const multipleDocuments = [...documents, ...documents]

  return (
    <ColorContextLocalExtension localColors={localColors}>
      <GetColorScheme>
        {(colorScheme) => (
          <div
            {...colorScheme.set('backgroundColor', 'background')}
            className={css({ pb: '24px', md: { pb: '80px' } })}
          >
            <div className={css({ pl: '15px', pr: '15px' })}>
              <div className={css({ borderTop: '1px solid black' })}>
                <div
                  className={cx(
                    nextReadHeader,
                    css({
                      textAlign: 'center',
                    }),
                  )}
                >
                  <h3>Gemerkte Beiträge</h3>
                  <p className='tagline'>Deine Leseliste</p>
                </div>
              </div>
              <FirstBookmarkItem document={documents[0]} />
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
                {multipleDocuments.slice(1).map((document) => (
                  <BookmarkItem key={document.id} document={document} />
                ))}
              </div>
            </div>
          </div>
        )}
      </GetColorScheme>
    </ColorContextLocalExtension>
  )
}

const FirstBookmarkItem = ({ document }: { document: BookmarkDocument }) => {
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
        maxWidth: '695px',
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
          }
        })}
      >
        {document.meta.title}
      </h4>
      {document.meta.image && (
        <img
          src={document.meta.image}
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
        <span>{getAuthors(document)}</span>
        <span>{document.meta.estimatedReadingMinutes} min</span>
      </div>

      {splitContent?.mainTruncated && (
        <div
          className={css({
            fontFamily: 'rubis',
            fontSize: 18,
            lineHeight: 1.8,
          })}
        >
          {renderSchema(splitContent.mainTruncated) as unknown as ReactNode}
        </div>
      )}
      <Link href={document.meta.path}>
        <span
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          })}
        >
          Weiterlesen
          <IconArrowRight size={20} />
        </span>
      </Link>
    </div>
  )
}

const BookmarkItem = ({ document }: { document: BookmarkDocument }) => {
  return (
    <div
      className={css({
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
          margin: 0
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        })}
      >
        <h4
          className={css({
            fontFamily: 'rubis',
            fontSize: 18,
            lineHeight: 1.2,
          })}
        >
          {document.meta.title} Add a lot of text here to see how it looks
        </h4>
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
