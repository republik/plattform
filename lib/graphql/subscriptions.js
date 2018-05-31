import { gql } from 'react-apollo'
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
      latestCommit {
        ...SimpleCommit
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleCommit}
  ${fragments.SimpleMilestone}
`
