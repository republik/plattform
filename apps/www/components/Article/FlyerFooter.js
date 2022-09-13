import { gql, useQuery } from '@apollo/client'
import { css } from 'glamor'
import {
  Loader,
  ArrowForwardIcon,
  ArrowBackIcon,
  IconButton,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import Link from 'next/link'
import { swissTime } from '../../lib/utils/format'
import { useMe } from '../../lib/context/MeContext'

const FORMAT_REPO_ID = 'republik/format-journal'
const dateParse = swissTime.format('%d.%m.%Y')

const styles = {
  footer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  }),
  navi: css({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }),
  date: css({
    ...fontStyles.sansSerifRegular16,
    marginRight: 20,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular17,
      marginRight: 24,
    },
  }),
}

const QUERY = gql`
  query flyerNavi($publishedAt: DateTime!, $repoId: String!) {
    prev: search(
      first: 1
      filter: {
        publishedAt: {
          to: $publishedAt
        }
      }
      filters: [
        { key: "format", value: "${FORMAT_REPO_ID}" }
        { not: true, key: "repoId", value: $repoId }
      ]
      sort: {
        key: publishedAt
        direction: DESC
      }
    ) {
      totalCount
      nodes {
        entity {
          ... on Document {
            id
            meta {
              path
              title
              publishDate
            }
          }
        }
      }
    }
    next: search(
      first: 1
      filter: {
        publishedAt: {
          from: $publishedAt
        }
      }
      filters: [
        { key: "format", value: "${FORMAT_REPO_ID}" }
        { not: true, key: "repoId", value: $repoId }
      ]
      sort: {
        key: publishedAt
        direction: ASC
      }
    ) {
      totalCount
      nodes {
        entity {
          ... on Document {
            id
            meta {
              path
              title
              publishDate
            }
          }
        }
      }
    }
  }
`

const FlyerNavi = ({ repoId, publishDate, actionBar }) => {
  const { data, loading, error } = useQuery(QUERY, {
    variables: {
      publishedAt: publishDate,
      repoId,
    },
  })
  const date = new Date(publishDate)
  const { hasAccess } = useMe()

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const prev = data.prev.nodes[0]?.entity?.meta
        const next = data.next.nodes[0]?.entity?.meta

        return (
          <div {...styles.footer}>
            {actionBar}
            {hasAccess && (
              <div {...styles.navi}>
                {prev && (
                  <Link href={prev.path} passHref>
                    <IconButton Icon={ArrowBackIcon} />
                  </Link>
                )}
                <span {...styles.date}>{dateParse(date)}</span>
                {next && (
                  <Link href={next.path} passHref>
                    <IconButton invert Icon={ArrowForwardIcon} />
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      }}
    />
  )
}

export default FlyerNavi
