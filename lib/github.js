const { createApolloFetch } = require('apollo-fetch')
const yaml = require('js-yaml')

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

const normalizers = {
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
  publicationNormalizer: ({
    tag_name: name,
    target_commitish: commitId,
    body,
    published_at: date,
    repo
  }) => {
    let scheduledAt
    let updateMailchimp = false
    try {
      ({
        scheduledAt = undefined,
        updateMailchimp = false
      } = yaml.safeLoad(body))
    } catch (e) { }
    const prepublication = name.indexOf('prepublication') > -1
    return {
      name,
      prepublication,
      scheduledAt,
      updateMailchimp,
      date,
      commit: {
        id: commitId
      },
      repo
    }
  },
  apolloTagNormalizer: (tag, repoId) => ({
    ...tag,
    date: tag.author.date,
    repo: {
      id: repoId
    }
  })
}

module.exports = {
  githubApolloFetch,
  githubRest,
  ...normalizers,
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
  getAnnotatedTags: async (repoId) => {
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
      .filter(tag => Object.keys(tag).length > 0)
      .map(tag => normalizers.apolloTagNormalizer(tag, repoId))
  },
  getLightwightTag: async (repoId, tagName) => {
    const [login, repoName] = repoId.split('/')
    const {
      data: {
        repository: {
          ref: tag
        }
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $qualifiedName: String!
        ) {
          repository(owner: $login, name: $repoName) {
            ref(qualifiedName: $qualifiedName) {
              name
              target {
                __typename
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
      `,
      variables: {
        login,
        repoName,
        qualifiedName: `refs/tags/${tagName}`
      }
    })

    console.log(tag)
    return normalizers.apolloTagNormalizer(tag.target, repoId)
  },
  getAllReleases: async (repoId, first = 100) => {
    const [login, repoName] = repoId.split('/')

    const getAllReleases = (after, releaseNodes = []) => {
      return githubApolloFetch({
        query: `
          query repository(
            $login: String!,
            $repoName: String!,
            $first: Int,
            $after: String,
          ) {
            repository(owner: $login, name: $repoName) {
              releases: releases(first: $first after: $after) {
                totalCount
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  name
                  isPrerelease
                  isDraft
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
        .then(response => response.data.repository.releases)
        .then(({ nodes, pageInfo: { hasNextPage, endCursor } }) => {
          const nextNodes = releaseNodes.concat(nodes)
          if (hasNextPage) {
            return getAllReleases(endCursor, nextNodes)
          }
          return nextNodes
        })
    }
    return getAllReleases()
  }
}
