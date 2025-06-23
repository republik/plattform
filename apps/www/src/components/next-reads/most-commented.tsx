import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { getAuthors } from '@app/components/next-reads/helpers'
import { nextReadHeader, nextReadItem } from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import React from 'react'

type ColorType = {
  color: string
  background: string
}

const COLOURS: ColorType[] = [
  { color: '#FCFBE8', background: '#317D7F' },
  { color: '#892387', background: '#BCB0E0' },
  { color: '#5D55C7', background: '#EEADA5' },
  { color: '#FCE8F6', background: '#94355C' },
]

const MD_HEIGHT = 867
const MD_WIDTH = 650

export const Cover3_4 = ({
  image,
  title,
}: {
  image: string
  title: string
}) => {
  return (
    <img
      src={image}
      alt={`cover for ${title}`}
      width={MD_WIDTH}
      height={MD_HEIGHT}
      style={{
        aspectRatio: '3/4',
        objectFit: 'cover',
      }}
    />
  )
}

function MostCommentedCoverText({ document }: { document: Document }) {
  return (
    <div
      className={cx(
        nextReadItem,
        css({
          width: '90%',
          ml: '5%',
          textAlign: 'center',
        }),
      )}
    >
      <h4>
        <span className={css({ fontSize: 32 })}>{document.meta.title}</span>
      </h4>
      <p className='author'>{getAuthors(document)}</p>
    </div>
  )
}

function MostCommentedWithImage({ document }: { document: Document }) {
  return (
    <div
      className={css({
        height: '867px',
        width: '650px',
        position: 'relative',
      })}
    >
      <Cover3_4 title={document.meta.title} image={document.meta.image} />

      <div
        className={css({
          position: 'absolute',
          bottom: 0,
          paddingBottom: 16,
          color: 'white',
          background:
            'linear-gradient(180deg, rgba(7, 7, 7, 0.00) 0%, #070707 100%)',
          backdropFilter: 'blur(2px)',
        })}
      >
        <MostCommentedCoverText document={document} />
      </div>
    </div>
  )
}

function MostCommentedWithoutImage({
  document,
  colors,
}: {
  document: Document
  colors: ColorType
}) {
  const { color, background } = colors

  return (
    <div
      style={{
        backgroundColor: background,
        color: color,
      }}
      className={css({
        height: '867px',
        width: '650px',
        display: 'flex',
        alignItems: 'center',
      })}
    >
      <MostCommentedCoverText document={document} />
    </div>
  )
}

function MostCommentedRead({
  document,
  colors,
}: {
  document: Document
  colors: ColorType
}) {
  // NOT SURE THIS IS GREAT
  /* const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!ref.current || !ref.current.parentElement.parentElement) return
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { root: ref.current.parentElement.parentElement, threshold: 0.7 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, []) */

  /*ref={ref}
    style={{
        opacity: visible ? 1 : 0.2,
        transition: 'opacity 0.3s',
      }}*/

  return (
    <div className={css({ position: 'relative' })}>
      <Link href={document.meta.path}>
        {document.meta.image ? (
          <MostCommentedWithImage document={document} />
        ) : (
          <MostCommentedWithoutImage document={document} colors={colors} />
        )}
      </Link>
    </div>
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
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
        })}
      >
        {documents.map((document, idx) => (
          <div
            key={document.id}
            className={css({
              scrollSnapAlign: 'start',
            })}
          >
            <MostCommentedRead
              document={document}
              colors={COLOURS[idx % COLOURS.length]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
