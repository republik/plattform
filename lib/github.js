const { createApolloFetch } = require('apollo-fetch')

const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql'
const { GITHUB_ACCESS_TOKEN } = process.env

const githubApolloFetch = createApolloFetch({
  uri: GITHUB_GRAPHQL_API_URL
}).use(({ options }, next) => {
  if (!options.headers) {
    options.headers = {}
  }
  options.headers['Authorization'] = `Bearer ${GITHUB_ACCESS_TOKEN}`
  next()
})
.useAfter(({ response }, next) => {
  if (response && response.parsed && response.parsed.errors) {
    throw new Error(JSON.stringify(response.parsed.errors))
  }
  next()
})

const GitHubApi = require('github')
const githubRest = new GitHubApi()
githubRest.authenticate({
  type: 'token',
  token: GITHUB_ACCESS_TOKEN
})

module.exports = {
  githubApolloFetch,
  githubRest,
  commitNormalizer: ({
    sha,
    commit: {
      message,
      author
    },
    parents,
    repo
  }) => ({
    id: sha,
    parentIds: parents
      ? parents.map(parent => parent.sha)
      : [],
    message: message,
    author: author,
    date: new Date(author.date),
    repo
  }),
  getRepo: async (repoId) => {
    const [login, repoName] = repoId.split('/')
    const {
      data: {
        repository: repo
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!
        ) {
          repository(
            owner: $login
            name: $repoName
          ) {
            name
          }
        }
      `,
      variables: {
        login,
        repoName
      }
    })
    return repo
  },
  getHeads: async (repoId) => {
    const [login, repoName] = repoId.split('/')
    const {
      data: {
        repository: {
          refs: {
            nodes: heads
          }
        }
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $first: Int
        ) {
          repository(
            owner: $login
            name: $repoName
          ) {
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
      `,
      variables: {
        login,
        repoName,
        first: 100
      }
    })
    return heads
  },
  getTags: async (repoId) => {
    const [login, repoName] = repoId.split('/')
    const {
      data: {
        repository: {
          refs: {
            nodes: tags
          }
        }
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $first: Int
        ) {
          repository(owner: $login, name: $repoName) {
            refs(refPrefix: "refs/tags/", first: $first) {
              nodes {
                name
                target {
                  ... on Tag {
                    name
                    message
                    oid
                    author: tagger {
                      name
                      email
                      date
                    }
                    commit: target {
                      ... on Commit {
                        id: oid
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        login,
        repoName,
        first: 100
      }
    })

    return tags
      .map(tag => tag.target)
      .map(tag => ({
        ...tag,
        repo: {
          id: repoId
        }
      }))
  }
}
