import * as fragments from '../../lib/graphql/fragments'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'

const commitMutation = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID
    $message: String!
    $document: DocumentInput!
    $isTemplate: Boolean
  ) {
    commit(
      repoId: $repoId
      parentId: $parentId
      message: $message
      document: $document
      isTemplate: $isTemplate
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

const getCommitById = gql`
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

const getLatestCommit = gql`
  query getLatestCommit($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestCommit {
        ...SimpleCommit
        document {
          id
          type
        }
      }
    }
  }
  ${fragments.SimpleCommit}
`

export const withCommitData = graphql(getCommitById, {
  skip: ({ router }) =>
    router.query.commitId === 'new' || !router.query.commitId,
  options: ({ router }) => ({
    variables: {
      repoId: getRepoIdFromQuery(router.query),
      commitId: router.query.commitId,
    },
  }),
  props: ({ data, ownProps: { router, t } }) => {
    if (data?.repo === null) {
      return {
        data: {
          error: t('repo/warn/missing', {
            repoId: getRepoIdFromQuery(router.query),
          }),
        },
      }
    }

    return { data }
  },
})

export const withLatestCommit = graphql(getLatestCommit, {
  skip: ({ router }) =>
    !!router.query.commitId && router.query.commitId !== 'new',
  options: ({ router }) => ({
    // always the latest
    fetchPolicy: 'network-only',
    variables: {
      repoId: getRepoIdFromQuery(router.query),
    },
  }),
  props: ({ data, ownProps: { router, t } }) => {
    if (router.query.commitId === 'new') {
      if (data.repo && data.repo.latestCommit) {
        return {
          data: {
            error: t('repo/add/alreadyExists'),
          },
        }
      }
      return {}
    }
    if (data?.repo === null) {
      return {
        data: {
          error: t('repo/warn/missing', {
            repoId: getRepoIdFromQuery(router.query),
          }),
        },
      }
    }
    return {
      data,
    }
  },
})

export const withCommitMutation = graphql(commitMutation, {
  props: ({ mutate }) => ({
    commitMutation: (variables) =>
      mutate({
        variables,
        update: (store, { data: { commit } }) => {
          const { repoId, parentId } = variables
          let data
          if (parentId) {
            const oldData = store.readQuery({
              query: getCommitById,
              variables: {
                repoId,
                commitId: parentId,
              },
            })
            data = {
              ...oldData,
              repo: {
                ...oldData.repo,
                commit,
              },
            }
          } else {
            data = {
              repo: {
                ...commit.repo,
                commit,
              },
            }
          }
          store.writeQuery({
            query: getCommitById,
            variables: {
              repoId,
              commitId: commit.id,
            },
            data,
          })
        },
      }),
  }),
})
