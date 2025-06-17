import {
  Document,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { NextReadsSection } from '@app/components/next-reads/section'
import { css } from '@republik/theme/css'

function CoverImage({ document }: { document: Document }) {
  return (
    <img
      className={css({
        aspectRatio: '1/1',
        objectFit: 'cover',
        width: '100%',
        marginBottom: 4,
      })}
      src={
        document.meta.facebookImage ||
        document.meta.image ||
        'https://a-z-animals.com/media/Penguin-Aptenodytes-Forsteri-walking-on-beach.jpg'
      }
      alt={document.meta.title}
    />
  )
}

function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  return (
    <h5
      className={css({
        // store the color in a css variable
        color: document.meta.format?.meta.color || 'text',
        fontFamily: 'gtAmericaStandard',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        marginBottom: 2,
      })}
    >
      {text}
    </h5>
  )
}

function MostRead({ document }: { document: Document }) {
  return (
    <div>
      <CoverImage document={document} />
      <CategoryLabel document={document} />
      <h4
        className={css({
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: 22,
          marginBottom: 2,
        })}
      >
        {document.meta.title}
      </h4>
      <p
        className={css({
          fontFamily: 'gtAmericaStandard',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.2,
        })}
      >
        {document.meta.estimatedReadingMinutes ||
          document.meta.estimatedConsumptionMinutes}{' '}
        Min
      </p>
    </div>
  )
}

function RecommendedRead({ document }: { document: Document }) {
  return (
    <div>
      <CoverImage document={document} />
      <CategoryLabel document={document} />
      <h4
        className={css({
          fontFamily: 'rubis',
          fontWeight: 500,
          fontSize: 22,
          marginBottom: 2,
        })}
      >
        {document.meta.title}
      </h4>
      <p
        className={css({
          fontFamily: 'rubis',
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.5,
          marginBottom: 2,
        })}
      >
        {document.meta.description}
      </p>
      <p
        className={css({
          fontFamily: 'gtAmericaStandard',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          marginBottom: 2,
        })}
      >
        Von{' '}
        {document.meta.contributors
          .filter((contributor) => contributor.kind.includes('Text'))
          .map((contributor) => contributor.name)
          .join(', ')}
      </p>
    </div>
  )
}

function NextReads() {
  const { data, loading } = useQuery(NextReadsDocument)

  if (loading) return null

  const sameTopic = data.documents.nodes.slice(0, 3)
  const mostRead = data.documents.nodes.slice(3, 11)

  return (
    <div
      className={css({
        maxWidth: 975,
        margin: '50px auto 0',
      })}
    >
      <NextReadsSection title='On the same topic'>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto',
            gap: 4,
          })}
        >
          {sameTopic.map(({ entity }: { entity: Document }) => (
            <div key={entity.id} className={css({ marginBottom: '4' })}>
              <RecommendedRead document={entity} />
            </div>
          ))}
        </div>
      </NextReadsSection>

      <NextReadsSection title='Most read'>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'auto',
            gap: 4,
          })}
        >
          {mostRead.map(({ entity }: { entity: Document }) => (
            <div key={entity.id} className={css({ marginBottom: '4' })}>
              <MostRead document={entity} />
            </div>
          ))}
        </div>
      </NextReadsSection>
    </div>
  )
}

export default NextReads
