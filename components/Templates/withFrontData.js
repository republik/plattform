import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { TeaserActiveDebates } from '@project-r/styleguide/lib/components/TeaserActiveDebates'
import { TeaserMyMagazine } from '@project-r/styleguide/lib/components/TeaserMyMagazine'

const feedQuery = gql`
  query getFrontFeed(
    $specificRepoIds: [ID!]
    $filters: [SearchGenericFilterInput!]
    $minPublishDate: DateRangeInput
    $first: Int
  ) {
    feed: search(
      filters: $filters
      filter: {
        feed: true
        publishedAt: $minPublishDate
        repoIds: $specificRepoIds
      }
      sort: { key: publishedAt, direction: DESC }
      first: $first
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
                repoId
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

export const withFeedData = graphql(feedQuery, {
  options: ({
    priorRepoIds,
    excludeRepoIds: excludeRepoIdsCS = '',
    specificRepoIds = [],
    minPublishDate
  }) => {
    const excludeRepoIds = [
      ...priorRepoIds,
      ...(typeof excludeRepoIdsCS === 'string'
        ? excludeRepoIdsCS.split(',')
        : excludeRepoIdsCS)
    ].filter(Boolean)

    return {
      variables: specificRepoIds.filter(Boolean).length
        ? { specificRepoIds }
        : {
            minPublishDate: minPublishDate && {
              from: minPublishDate
            },
            first: 2,
            filters: [
              { key: 'template', not: true, value: 'section' },
              { key: 'template', not: true, value: 'format' },
              { key: 'template', not: true, value: 'front' }
            ].concat(
              excludeRepoIds.map(repoId => ({
                key: 'repoId',
                not: true,
                value: repoId
              }))
            )
          }
    }
  }
})

export const withDiscussionsData = graphql(
  gql`
    ${TeaserActiveDebates.data.query}
  `,
  TeaserActiveDebates.data.config
)

export const withMyMagazineData = graphql(
  gql`
    ${TeaserMyMagazine.data.query}
  `,
  TeaserMyMagazine.data.config
)
