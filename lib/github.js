const fetch = require('isomorphic-unfetch')
const { createApolloFetch } = require('apollo-fetch')

const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql'

const createGithubFetchForUser = (user) => {
  return createApolloFetch({
    uri: GITHUB_GRAPHQL_API_URL
  }).use(({ request, options }, ghNext) => {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers['Authorization'] = `Bearer ${user.githubAccessToken}`
    ghNext()
  })
}

const commit = async (token, repoId, parents, tree, message) => {
  const response = await fetch(`https://api.github.com/repos/${repoId}/git/commits`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      tree,
      parents
    })
  })

  return response.json()
}

const heads = async (user, repoId) => {
  const headsQuery = `
    query repository(
      $login: String!,
      $repoName: String!,
      $first: Int
    ) {
      repository(owner: $login, name: $repoName) {
        refs(refPrefix: "refs/heads/", first: $first) {
          nodes {
            name
            target {
              ... on Commit {
                oid
              }
            }
          }
        }
      }
    }
  `
  const [login, repoName] = repoId.split('/')
  const variables = {
    login,
    repoName,
    first: 100
  }

  const {
    errors,
    data: {
      repository: {
        refs: {
          nodes: heads
        }
      }
    }
  } = await createGithubFetchForUser(user)({ query: headsQuery, variables })
  if (errors) {
    throw new Error(JSON.stringify(errors))
  }

  return heads
}

module.exports = {
  createGithubFetchForUser,
  commit,
  heads
}
