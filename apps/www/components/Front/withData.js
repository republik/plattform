import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { TeaserActiveDebates, TeaserMyMagazine } from '@project-r/styleguide'

export const FRONT_FEED_QUERY = gql`
  query getFrontFeed(
    $specificRepoIds: [ID!]
    $filters: [SearchGenericFilterInput!]
    $minPublishDate: DateRangeInput
  ) {
    feed: search(
      filters: $filters
      filter: {
        feed: true
        publishedAt: $minPublishDate
        repoIds: $specificRepoIds
      }
      sort: { key: publishedAt, direction: DESC }
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        entity {
          ... on Document {
            id
            meta {
              credits
              shortTitle
              title
              description
              publishDate
              prepublication
              path
              kind
              template
              color
              format {
                id
                meta {
                  path
                  title
                  color
                  kind
                }
              }
            }
          }
        }
      }
    }
  }
`

export const getFrontFeedOptions = ({
  priorRepoIds,
  excludeRepoIds: excludeRepoIdsCS = '',
  specificRepoIds = [],
  minPublishDate,
  lastPublishedAt,
}) => {
  const excludeRepoIds = [
    ...priorRepoIds,
    ...(typeof excludeRepoIdsCS === 'string'
      ? excludeRepoIdsCS.split(',')
      : excludeRepoIdsCS),
  ].filter(Boolean)

  let from =
    minPublishDate ||
    (lastPublishedAt
      ? `${lastPublishedAt.split('T')[0]}T02:00:00.000Z`
      : undefined)

  return {
    variables: specificRepoIds.filter(Boolean).length
      ? { specificRepoIds }
      : {
          minPublishDate: from && {
            from,
          },
          filters: [
            { key: 'template', not: true, value: 'section' },
            { key: 'template', not: true, value: 'format' },
            { key: 'template', not: true, value: 'front' },
          ].concat(
            excludeRepoIds.map((repoId) => ({
              key: 'repoId',
              not: true,
              value: repoId,
            })),
          ),
        },
  }
}

export const withFeedData = graphql(FRONT_FEED_QUERY, {
  options: getFrontFeedOptions,
})

export const withDiscussionsData = graphql(
  gql`
    ${TeaserActiveDebates.data.query}
  `,
  TeaserActiveDebates.data.config,
)

export const withMyMagazineData = graphql(
  gql`
    ${TeaserMyMagazine.data.query}
  `,
  TeaserMyMagazine.data.config,
)
