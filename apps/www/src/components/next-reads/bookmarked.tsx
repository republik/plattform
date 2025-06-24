import { useQuery } from '@apollo/client'
import {
  GetCollectionItemsDocument,
  ProgressState,
  GetCollectionItemsQuery,
} from '../../../graphql/republik-api/__generated__/gql/graphql'
import { css, cx } from '@republik/theme/css'
import { nextReadHeader } from './styles'
import { Cover3_4 } from './most-commented'
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
      progress: ProgressState.Unfinished,
    },
  })

  if (loading) return null

  const documents =
    data.me?.collectionItems.nodes.map((node) => node.document) || []

  return (
    <ColorContextLocalExtension localColors={localColors}>
      <GetColorScheme>
        {(colorScheme) => (
          <div className={colorScheme.set('background', 'background')}>
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
            <div className={css({ pt: 4, pb: 16 })}>
              {documents.map((document) => (
                <BookmarkItem key={document.id} document={document} />
              ))}
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
        margin: '16px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        maxWidth: '695px',
        pl: '15px',
        pr: '15px',
      })}
    >
      <h4
        className={css({
          fontFamily: 'rubis',
          fontSize: 24,
          lineHeight: 1.2,
          textAlign: 'center',
        })}
      >
        {document.meta.title}
      </h4>
      <Cover3_4 image={document.meta.image} title={document.meta.title} />
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
  console.log(document.userProgress?.max?.percentage)
  return (
    <div>
      <h4>{document.meta.title}</h4>
    </div>
  )
}
