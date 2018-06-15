import gql from 'graphql-tag'
import * as fragments from './fragments'

export const repoSubscription = gql`
  subscription onRepoUpdate($repoId: ID!) {
    repoUpdate(repoId: $repoId) {
      id
      commits {
        nodes {
          ...SimpleCommit
        }
      }
    }
  }
  ${fragments.SimpleCommit}
`

export const uncommittedChangesSubscription = gql`
  subscription onUncommitedChange(
    $repoId: ID!
  ) {
    uncommittedChanges(
      repoId: $repoId
    ) {
      repoId
      action
      user {
        id
        email
        name
      }
    }
  }
`

export const treeRepoSubscription = gql`
  subscription onRepoUpdate($repoId: ID!) {
    repoUpdate(repoId: $repoId) {
      id
      commits (first: 1){
        nodes {
          ...SimpleCommit
        }
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleCommit}
  ${fragments.SimpleMilestone}
`
