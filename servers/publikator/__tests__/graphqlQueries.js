const SIMPLE_REPOS_QUERY = `
  {
    repos(first: 10) {
      nodes {
        id
      }
    }
  }
`

const REPO_QUERY = `
  query repo(
    $repoId: ID!
  ){
    repo(id: $repoId) {
      commits(first: 10) {
        nodes {
          id
          parentIds
          document {
            content
          }
        }
      }
      latestCommit {
        id
      }
    }
  }
`

const UNCOMMITED_CHANGES_SUBSCRIPTION = `
  subscription uncommittedChanges(
    $repoId: ID!
  ){
    uncommittedChanges(repoId: $repoId) {
      action
      user {
        email
      }
    }
  }
`

const UNCOMMITED_CHANGES_MUTATION = `
  mutation uncommitedChanges(
    $repoId: ID!
    $action: Action!
  ){
    uncommittedChanges(
      repoId: $repoId
      action: $action
    )
  }
`

const COMMIT_MUTATION = `
  mutation commit($repoId: ID!, $parentId: ID, $message: String!, $document: DocumentInput!) {
    commit(repoId: $repoId, parentId: $parentId, message: $message, document: $document) {
      ...CommitWithDocument
      repo {
        ...EditPageRepo
        __typename
      }
      __typename
    }
  }

  fragment CommitWithDocument on Commit {
    ...SimpleCommit
    document {
      id
      content
      meta {
        title
        template
        kind
        color
        format {
          meta {
            title
            color
            kind
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment SimpleCommit on Commit {
    id
    message
    parentIds
    date
    author {
      email
      name
      __typename
    }
    __typename
  }

  fragment EditPageRepo on Repo {
    id
    meta {
      publishDate
      __typename
    }
    __typename
  }
`

const commit = async ({
  apolloFetch = global.instance.createApolloFetch(),
  variables,
  user
}) => {
  const result = await apolloFetch({
    query: COMMIT_MUTATION,
    variables
  })

  expect(result.errors).toBeFalsy()
  expect(result.data).toBeTruthy()
  expect(result.data.commit).toBeTruthy()

  const { commit } = result.data
  expect(commit.id).toBeTruthy()
  expect(commit.repo.id).toBe(variables.repoId)
  expect(commit.parentIds).toEqual(variables.parentId ? [ variables.parentId ] : [ ])
  expect(commit.message).toBe(variables.message)
  expect(commit.date).toBeTruthy()
  expect(commit.author.email).toBe(user.email)
  expect(commit.author.name).toBe(user.name)

  return result
}

module.exports = {
  SIMPLE_REPOS_QUERY,
  REPO_QUERY,
  UNCOMMITED_CHANGES_SUBSCRIPTION,
  UNCOMMITED_CHANGES_MUTATION,
  commit
}
