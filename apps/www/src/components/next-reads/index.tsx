import {
  Document,
  NextReadsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { NextReadsSection } from '@app/components/next-reads/section'
import { css } from '@republik/theme/css'

function RecommendedRead({ document }: { document: Document }) {
  return (
    <div>
      <img
        className={css({
          aspectRatio: '4/3',
          width: '100%',
          marginBottom: 4,
        })}
        src={document.meta.facebookImage || document.meta.image}
        alt={document.meta.title}
      />
      {document.meta.format && <h5>{document.meta.format.meta.title}</h5>}
      {document.meta.series && (
        <h5
          className={css({
            fontFamily: 'gtAmericaStandard',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: 2,
          })}
        >
          {document.meta.series.title}
        </h5>
      )}
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
          .join(',')}
      </p>
    </div>
  )
}

function NextReads() {
  const { data, loading } = useQuery(NextReadsDocument)

  if (loading) return null

  const documents = data.documents.nodes.slice(0, 3)
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
          {documents.map(({ entity }: { entity: Document }) => (
            <div key={entity.id} className={css({ marginBottom: '4' })}>
              <RecommendedRead document={entity} />
            </div>
          ))}
        </div>
      </NextReadsSection>
    </div>
  )
}

export default NextReads
