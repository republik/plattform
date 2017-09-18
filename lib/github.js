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

const publicationVersionRegex = /^v(\d+)(-prepublication)?.*/

module.exports = {
  githubApolloFetch,
  githubRest,
  publicationVersionRegex,
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
                    author {
                      date
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
    return heads
  },
  getAnnotatedTags: async (repoId, first = 100) => {
    const [login, repoName] = repoId.split('/')

    const getAll = (after, nodesArray = []) => {
      return githubApolloFetch({
        query: `
          query repository(
            $login: String!,
            $repoName: String!,
            $first: Int
          ) {
            repository(owner: $login, name: $repoName) {
              refs(refPrefix: "refs/tags/", first: $first) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
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
          first,
          after
        }
      })
        .then(response => response.data.repository.refs)
        .then(({ nodes, pageInfo: { hasNextPage, endCursor } }) => {
          const nextNodes = nodesArray.concat(nodes)
          if (hasNextPage) {
            return getAll(endCursor, nextNodes)
          }
          return nextNodes
        })
    }

    return getAll()
      .then(tags => tags
        .map(tag => tag.target)
        .filter(tag => Object.keys(tag).length > 0) // only annotated
        .map(tag => ({
          ...tag,
          date: tag.author.date,
          commit: {
            ...tag.commit,
            repo: {
              id: repoId
            }
          },
          repo: {
            id: repoId
          }
        }))
      )
  }
}
