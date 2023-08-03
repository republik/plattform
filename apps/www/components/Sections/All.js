import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ascending } from 'd3-array'
import { css } from 'glamor'
import { gql } from '@apollo/client'
import Link from '../Link/Href'
import withT from '../../lib/withT'

import {
  Loader,
  FormatTag,
  mediaQueries,
  TeaserSectionTitle,
  useColorContext,
  colors,
} from '@project-r/styleguide'

const SPACE = 15
const SPACE_BIG = 20

const styles = {
  sectionTitle: css({
    marginBottom: SPACE / 2,
    [mediaQueries.mUp]: {
      marginBottom: SPACE_BIG / 2,
    },
  }),
  section: css({
    paddingTop: SPACE,
    marginBottom: SPACE,
    '& + &': {
      borderTopWidth: 1,
      borderTopStyle: 'solid',
    },
    [mediaQueries.mUp]: {
      paddingTop: SPACE_BIG,
      marginBottom: SPACE_BIG,
    },
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

const getSections = gql`
  query getSections {
    sections: documents(template: "section") {
      nodes {
        id
        meta {
          title
          path
          color
          kind
        }
        formats: linkedDocuments {
          nodes {
            id
            meta {
              title
              path
              color
              kind
            }
            linkedDocuments(feed: true, first: 0) {
              totalCount
            }
          }
        }
      }
    }
  }
`

const SectionIndex = ({ data: { loading, error, sections }, t }) => {
  const [colorScheme] = useColorContext()
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        return (
          <>
            {sections.nodes.map(({ id, meta, formats }) => {
              const hasFormats = formats.nodes.length > 0

              return (
                <section
                  {...styles.section}
                  {...colorScheme.set('borderColor', 'divider')}
                  style={{
                    paddingBottom: hasFormats ? 5 : 0,
                  }}
                  key={id}
                >
                  <div
                    {...styles.sectionTitle}
                    style={{
                      color: hasFormats ? '#979797' : undefined,
                    }}
                  >
                    <Link href={meta.path} passHref>
                      {hasFormats ? (
                        <TeaserSectionTitle small>
                          {meta.title}
                        </TeaserSectionTitle>
                      ) : (
                        <a {...styles.link}>
                          <FormatTag label={meta.title} count={null} />
                        </a>
                      )}
                    </Link>
                  </div>
                  {[]
                    .concat(formats.nodes)
                    .sort((a, b) => ascending(a.meta.title, b.meta.title))
                    .map(({ id, meta: formatMeta, linkedDocuments }) => (
                      <Link href={formatMeta.path} passHref key={id}>
                        <a {...styles.link}>
                          <FormatTag
                            color={
                              formatMeta.color ||
                              `var(--color-${formatMeta.kind})`
                            }
                            label={formatMeta.title}
                            count={linkedDocuments.totalCount || null}
                          />
                        </a>
                      </Link>
                    ))}
                </section>
              )
            })}
          </>
        )
      }}
    />
  )
}

export default compose(withT, graphql(getSections))(SectionIndex)
