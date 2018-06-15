import gql from 'graphql-tag'
import * as fragments from './fragments'

export const unpublish = gql`
mutation unpublish(
  $repoId: ID!
) {
  unpublish(repoId: $repoId)
}
`

export const publish = gql`
mutation publish(
  $repoId: ID!,
  $commitId: ID!,
  $prepublication: Boolean!,
  $scheduledAt: DateTime,
  $updateMailchimp: Boolean!,
  $ignoreUnresolvedRepoIds: Boolean
) {
  publish(
    repoId: $repoId,
    commitId: $commitId,
    prepublication: $prepublication,
    scheduledAt: $scheduledAt,
    updateMailchimp: $updateMailchimp,
    ignoreUnresolvedRepoIds: $ignoreUnresolvedRepoIds) {
    unresolvedRepoIds
    publication {
      name
    }
  }
}
`

export const editRepoMeta = gql`
mutation editRepoMeta(
  $repoId: ID!
  $creationDeadline: DateTime
  $productionDeadline: DateTime
  $publishDate: DateTime
  $briefingUrl: String
) {
  editRepoMeta(
    repoId: $repoId
    creationDeadline: $creationDeadline
    productionDeadline: $productionDeadline
    publishDate: $publishDate
    briefingUrl: $briefingUrl
  ) {
    id
    meta {
      creationDeadline
      productionDeadline
      publishDate
      briefingUrl
    }
  }
}
`

export const placeMilestone = gql`
mutation placeMilestone(
  $repoId: ID!
  $commitId: ID!
  $name: String!
  $message: String!
) {
  placeMilestone(
    repoId: $repoId
    commitId: $commitId
    name: $name
    message: $message
  ) {
    ...MilestoneWithCommit
  }
}
${fragments.MilestoneWithCommit}
`

export const removeMilestone = gql`
  mutation removeMilestone(
    $repoId: ID!
    $name: String!
  ) {
    removeMilestone(
      repoId: $repoId
      name: $name
    )
  }
`

export const commit = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID
    $message: String!
    $document: DocumentInput!
  ) {
    commit(
      repoId: $repoId
      parentId: $parentId
      message: $message
      document: $document
    ) {
      ...CommitWithDocument
      repo {
        ...EditPageRepo
      }
    }
  }
  ${fragments.CommitWithDocument}
  ${fragments.EditPageRepo}
`

export const hasUncommitedChanges = gql`
  mutation uncommittedChanges($repoId: ID!, $action: Action!) {
    uncommittedChanges(repoId: $repoId, action: $action)
  }
`
