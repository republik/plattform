import { gql } from 'react-apollo'
import * as fragments from './fragments'

export const getVideoEmbed = gql`
query getVideoEmbed($id: ID!, $embedType: EmbedType!) {
  embed(id: $id, embedType: $embedType) {
    __typename
    ... on YoutubeEmbed {
      platform
      id
      createdAt
      retrievedAt
      userName
      userUrl
      thumbnail
      title
      userName
      userProfileImageUrl
      aspectRatio
    }
    ... on VimeoEmbed {
      platform
      id
      createdAt
      retrievedAt
      userName
      userUrl
      thumbnail
      title
      userName
      userProfileImageUrl
      aspectRatio
      src {
        mp4
        hls
        thumbnail
      }
    }
  }
}
`

export const getTwitterEmbed = gql`
query getTwitterEmbed($id: ID!, $embedType: EmbedType!) {
  embed(id: $id, embedType: $embedType) {
    __typename
    ... on TwitterEmbed {
      id
      createdAt
      retrievedAt
      text
      html
      userId
      userName
      userScreenName
      userProfileImageUrl
      image
      more
      playable
    }
  }
}
`

export const getUsers = gql`
query getUsers($search: String!) {
  users(search: $search) {
    firstName
    lastName
    email
    id
  }
}
`

export const filterRepos = gql`
query searchRepo($after: String, $search: String) {
  repos(first: 10, after: $after, search: $search) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      id
      latestCommit {
        id
        document {
          id
          meta {
            title
            image
            description
            credits
            kind
            color
            format {
              id
              repoId
              meta {
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

export const filterAndOrderRepos = gql`
query repoListSearch($after: String, $search: String, $orderBy: RepoOrderBy) {
  repos(
    first: 100,
    after: $after,
    search: $search,
    orderBy: $orderBy
  ) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      id
      meta {
        creationDeadline
        productionDeadline
        publishDate
        briefingUrl
      }
      latestCommit {
        id
        date
        message
        document {
          id
          meta {
            template
            title
            credits
          }
        }
      }
      milestones {
        name
        immutable
      }
      latestPublications {
        name
        prepublication
        live
        scheduledAt
        document {
          id
          meta {
            path
            slug
          }
        }
      }
    }
  }
}
`

export const getRepoWithPublications = gql`
  query repoWithPublications($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestPublications {
        name
        prepublication
        live
        scheduledAt
        updateMailchimp
        date
        author {
          name
          email
        }
      }
    }
  }
`

export const getRepoWithCommit = gql`
  query repoWithCommit($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      meta {
        publishDate
      }
      latestPublications {
        date
        name
        live
        prepublication
        scheduledAt
      }
      commit(id: $commitId) {
        id
        message
        date
        author {
          email
          name
        }
        document {
          id
          content
          meta {
            slug
            emailSubject
            template
            format {
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
`

export const getCommits = gql`
  query getCommits($repoId: ID!, $after: String) {
    repo(id: $repoId) {
      id
      commits(first: 3, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
        nodes {
          ...SimpleCommit
        }
      }
    }
  }
  ${fragments.SimpleCommit}
`

export const getUncommittedChanges = gql`
  query getUncommittedChanges($repoId: ID!) {
    repo(id: $repoId) {
      id
      uncommittedChanges {
        id
        email
        name
      }
    }
  }
`

export const getMilestones = gql`
  query repoMilestones($repoId: ID!) {
    repo(id: $repoId) {
      id
      milestones {
        ...MilestoneWithCommit
      }
    }
  }
  ${fragments.MilestoneWithCommit}
  `

export const getCommitById = gql`
    query getCommitById($repoId: ID!, $commitId: ID!) {
      repo(id: $repoId) {
        ...EditPageRepo
        commit(id: $commitId) {
          ...CommitWithDocument
        }
      }
    }
    ${fragments.EditPageRepo}
    ${fragments.CommitWithDocument}
  `

export const getLatestCommit = gql`
  query getLatestCommit($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestCommit {
        ...SimpleCommit
      }
    }
  }
  ${fragments.SimpleCommit}
`

export const getRepoHistory = gql`
  query repoWithHistory(
    $repoId: ID!
    $first: Int!
    $after: String
  ) {
    repo(id: $repoId) {
      id
      commits(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...SimpleCommit
        }
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleMilestone}
  ${fragments.SimpleCommit}
`
