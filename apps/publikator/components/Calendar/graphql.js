import { gql } from '@apollo/client'

const repoFragment = `
  fragment CalendarRepoFragment on Repo {
    id
    meta {
      publishDate
    }
    latestCommit {
      id
      date
      message
      author {
        name
      }
      document {
        id
        meta {
          template
          title
          series {
            title
            overview {
              id
              repoId
            }
            episodes {
              label
              document {
                id
                repoId
              }
            }
          }
          section {
            id
            meta {
              title
            }
          }
          format {
            id
            meta {
              title
              color
              kind
            }
          }
          dossier {
            id
            meta {
              title
            }
          }
        }
      }
    }
  }
`

export const reposPerWeek = gql`
  query repoWeek($publishDateRange: RepoPublishDateRange) {
    reposSearch(first: 50, publishDateRange: $publishDateRange) {
      nodes {
        ...CalendarRepoFragment
        currentPhase {
          key
          color
          label
        }
      }
    }
  }
  ${repoFragment}
`

export const getPlaceholder = gql`
  query getPlaceholder($repoId: ID!) {
    repo(id: $repoId) {
      ...CalendarRepoFragment
    }
  }
  ${repoFragment}
`
