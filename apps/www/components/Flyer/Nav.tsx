import React from 'react'
import { css } from 'glamor'
import { gql, useQuery } from '@apollo/client'
import Link from 'next/link'

import {
  ArrowForwardIcon,
  ArrowBackIcon,
  IconButton,
  FlyerDate,
  mediaQueries,
} from '@project-r/styleguide'

import { useMe } from '../../lib/context/MeContext'

const FORMAT_REPO_ID = 'republik/format-journal'

const styles = {
  navi: css({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
  }),
  date: css({
    marginRight: 20,
    [mediaQueries.mUp]: {
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

const Nav: React.FC<{ repoId: string; publishDate: string }> = ({
  repoId,
  publishDate,
}) => {
  const { hasAccess } = useMe()
  const { data, loading } = useQuery(QUERY, {
    variables: {
      publishedAt: publishDate,
      repoId,
    },
    skip: !hasAccess || !repoId || !publishDate,
  })
  const prev = data?.prev.nodes[0]?.entity?.meta
  const next = data?.next.nodes[0]?.entity?.meta
  return (
    <div {...styles.navi}>
      {/* prevent flicker */}
      {hasAccess && (loading || prev) && (
        <Link href={prev?.path || '#'} passHref legacyBehavior>
          <IconButton Icon={ArrowBackIcon} />
        </Link>
      )}
      <div {...styles.date}>
        <FlyerDate date={publishDate} />
      </div>
      {next && (
        <Link href={next?.path || '#'} passHref legacyBehavior>
          <IconButton invert Icon={ArrowForwardIcon} />
        </Link>
      )}
    </div>
  )
}

export default Nav
