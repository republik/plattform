import { gql, useQuery } from '@apollo/client'
import { Loader } from '@project-r/styleguide'
import Link from 'next/link'

const FORMAT_REPO_ID = 'republik/format-journal'

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

const FlyerNavi = ({ repoId, publishDate }) => {
  const { data, loading, error } = useQuery(QUERY, {
    variables: {
      publishedAt: publishDate,
      repoId,
    },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const prev = data.prev.nodes[0]?.entity?.meta
        const next = data.next.nodes[0]?.entity?.meta
        return (
          <div>
            <p>
              self: {repoId}
              <br />
              {publishDate}
              <br />
              prevCount {data.prev.totalCount}
              <br />
              nextCount {data.next.totalCount}
            </p>
            {prev && (
              <p>
                prev:{' '}
                <Link href={prev.path} passHref>
                  <a>
                    {prev.title}
                    <br />
                    {prev.publishDate}
                  </a>
                </Link>
              </p>
            )}
            {next && (
              <p>
                next:{' '}
                <Link href={next.path} passHref>
                  <a>
                    {next.title}
                    <br />
                    {next.publishDate}
                  </a>
                </Link>
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

export default FlyerNavi
