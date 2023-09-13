import { mediaQueries, fontStyles, FormatTag } from '@project-r/styleguide'
import { css } from 'glamor'
import { ascending } from 'd3-array'
import Link from 'next/link'

const styles = {
  container: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 27,
    [mediaQueries.mUp]: {
      marginTop: -20,
    },
  }),
  item: css({
    margin: '8px 15px',
    whiteSpace: 'nowrap',
  }),
  label: css({
    ...fontStyles.sansSerifMedium19,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium26,
    },
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

const SinglePageNav = ({ color, linkedDocuments = { nodes: [] } }) => {
  if (linkedDocuments.nodes.length < 1) {
    return null
  }
  return (
    <div {...styles.container}>
      {linkedDocuments.nodes
        .filter((d) => d.meta.template === 'format')
        .sort((a, b) => ascending(a.meta.title, b.meta.title))
        .map((d) => {
          return (
            <div key={d.id} {...styles.item}>
              <Link
                href={d.meta.path}
                key={d.meta.path}
                passHref
                {...styles.link}
              >
                <FormatTag
                  color={d.meta.color || color}
                  label={d.meta.title}
                  count={d.linkedDocuments.totalCount || null}
                />
              </Link>
            </div>
          )
        })}
    </div>
  )
}

export default SinglePageNav
