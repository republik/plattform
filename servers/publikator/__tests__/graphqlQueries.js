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

const REPO_COMMIT_QUERY = `
  query repo(
    $repoId: ID!
    $commitId: ID!
  ){
    repo(id: $repoId) {
      commit(id: $commitId) {
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
  expect(commit.author.name).toBe(`${user.firstName} ${user.lastName}`)

  return result
}

const PLACE_MILESTONE_MUTATION = `
  mutation placeMilestone(
    $repoId: ID!
    $commitId: ID!
    $name: String!
    $message: String!
  ){
    placeMilestone(
      repoId: $repoId
      commitId: $commitId
      name: $name
      message: $message
    ) {
      name
      message
      commit {
        id
      }
      date
      author {
        name
        email
        user {
          email
        }
      }
      immutable
    }
  }
`

const placeMilestone = async ({
  apolloFetch = global.instance.createApolloFetch(),
  variables,
  user
}) => {
  const result = await apolloFetch({
    query: PLACE_MILESTONE_MUTATION,
    variables
  })

  expect(result.errors).toBeFalsy()
  expect(result.data).toBeTruthy()
  expect(result.data.placeMilestone).toBeTruthy()

  checkMilestone({
    milestone: result.data.placeMilestone,
    variables,
    user
  })

  return result
}

const checkMilestone = ({
  milestone,
  variables,
  user
}) => {
  const {
    name,
    message,
    commit,
    date,
    author,
    immutable
  } = milestone
  expect(name).toBe(variables.name.replace(' ', '-'))
  expect(message).toBe(variables.message)
  expect(commit.id).toBe(variables.commitId)
  expect(date).toBeTruthy()
  expect(author.name).toBe(`${user.firstName} ${user.lastName}`)
  expect(author.email).toBe(user.email)
  expect(author.user.email).toBe(user.email)
  expect(immutable).toBe(false)
}

const REMOVE_MILESTONE_MUTATION = `
  mutation removeMilestone(
    $repoId: ID!
    $name: String!
  ){
    removeMilestone(
      repoId: $repoId
      name: $name
    )
  }
`

const REPO_MILESTONES_QUERY = `
  query repo(
    $repoId: ID!
  ){
    repo(id: $repoId) {
      milestones {
        name
        message
        commit {
          id
        }
        date
        author {
          name
          email
          user {
            email
          }
        }
        immutable
      }
    }
  }
`

const DOCUMENT_META_PARTIAL = `
  meta {
    title
    slug
    emailSubject
    description
    facebookTitle
    facebookDescription
    twitterTitle
    twitterDescription
    path
    publishDate
    feed
    gallery
    subject
    template
  }
`

const PUBLISH_MUTAION = `
  mutation publish(
    $repoId: ID!
    $commitId: ID!
    $prepublication: Boolean!
    $updateMailchimp: Boolean!
    $scheduledAt: DateTime
  ) {
    publish(
      repoId: $repoId
      commitId: $commitId
      prepublication: $prepublication
      updateMailchimp: $updateMailchimp
      scheduledAt: $scheduledAt
    ) {
      unresolvedRepoIds
      publication {
        name
        live
        sha
        prepublication
        updateMailchimp
        scheduledAt
        date
        author {
          name
          email
          user {
            email
          }
        }
        commit {
          id
          document {
            content
            ${DOCUMENT_META_PARTIAL}
          }
        }
      }
    }
  }
`

const UNPUBLISH_MUTAION = `
  mutation unpublish(
    $repoId: ID!
  ) {
    unpublish(repoId: $repoId)
  }
`

const LATEST_PUBLICATIONS_QUERY = `
  query latestPublications(
    $repoId: ID!
  ){
    repo(id: $repoId) {
      meta {
        publishDate
      }
      latestPublications {
        name
        live
        sha
        prepublication
        scheduledAt
        updateMailchimp
        date
        author {
          name
          email
          user {
            email
          }
        }
        commit {
          id
          document {
            content
            ${DOCUMENT_META_PARTIAL}
          }
        }
      }
    }
  }
`

const getLatestPublications = async ({
  apolloFetch = global.instance.createApolloFetch(),
  repoId
}) => {
  const result = await apolloFetch({
    query: LATEST_PUBLICATIONS_QUERY,
    variables: {
      repoId
    }
  })

  expect(result.errors).toBeFalsy()
  expect(result.data).toBeTruthy()

  return result
}

const DOCUMENTS_QUERY = `
  {
    documents {
      nodes {
        content
        ${DOCUMENT_META_PARTIAL}
      }
    }
  }
`

const getDocuments = async ({
  apolloFetch = global.instance.createApolloFetch(),
  user
}) => {
  const testUser = global.testUser
  if (user !== undefined) {
    global.testUser = user
  }
  const result = await apolloFetch({
    query: DOCUMENTS_QUERY
  })
  global.testUser = testUser

  expect(result.errors).toBeFalsy()
  expect(result.data).toBeTruthy()

  return result
}

const DOCUMENT_QUERY = `
  query document(
    $path: String!
  ){
    document(path: $path) {
      content
      ${DOCUMENT_META_PARTIAL}
    }
  }
`

const getDocument = async ({
  apolloFetch = global.instance.createApolloFetch(),
  user,
  path
}) => {
  const testUser = global.testUser
  if (user !== undefined) {
    global.testUser = user
  }
  const result = await apolloFetch({
    query: DOCUMENT_QUERY,
    variables: {
      path
    }
  })
  global.testUser = testUser

  expect(result.errors).toBeFalsy()
  expect(result.data).toBeTruthy()

  return result
}

const getRefs = async (repoId) => {
  const { createGithubClients } = require('../lib/github')
  const { githubRest } = await createGithubClients()

  const liveRefs = [
    'publication',
    'prepublication'
  ]
  const allRefs = [
    ...liveRefs,
    'scheduled-publication',
    'scheduled-prepublication'
  ]

  const [owner, repo] = repoId.split('/')
  return Promise.all([
    ...allRefs.map(ref =>
      githubRest.gitdata.getRef({
        owner,
        repo,
        ref: `tags/${ref}`
      })
        .then(response => response.data)
        .catch(e => {})
    )
  ])
    .then(refs => refs
      .filter(Boolean)
    )
}

module.exports = {
  SIMPLE_REPOS_QUERY,
  REPO_QUERY,
  REPO_COMMIT_QUERY,
  UNCOMMITED_CHANGES_SUBSCRIPTION,
  UNCOMMITED_CHANGES_MUTATION,
  COMMIT_MUTATION,
  commit,
  placeMilestone,
  checkMilestone,
  PLACE_MILESTONE_MUTATION,
  REMOVE_MILESTONE_MUTATION,
  REPO_MILESTONES_QUERY,
  DOCUMENT_META_PARTIAL,
  PUBLISH_MUTAION,
  UNPUBLISH_MUTAION,
  getLatestPublications,
  getDocuments,
  getDocument,
  getRefs
}
