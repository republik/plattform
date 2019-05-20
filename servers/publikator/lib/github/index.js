const { descending } = require('d3-array')
const { lib: {
  clients: createGithubClients,
  utils: { gitAuthor }
} } = require('@orbiting/backend-modules-github')
const { getRepos } = require('./getRepos')
const uniqWith = require('lodash/uniqWith')
const debug = require('debug')('publikator:github')

const publicationVersionRegex = /^v(\d+)(-prepublication)?.*/

const tagNormalizer = (tag, repoId, refName) => ({
  ...tag,
  refName,
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
})

const normalizeRestCommit = ({
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
})

const normalizeGQLCommit = (repo, commit) => ({
  ...commit,
  id: commit.oid,
  date: commit.committedDate,
  parentIds: commit.parents.nodes.map(v => v.oid),
  repo
})

module.exports = {
  gitAuthor,
  getRepos,
  publicationVersionRegex,
  createGithubClients,
  tagNormalizer,
  normalizeGQLCommit,
  commitNormalizer: normalizeRestCommit,
  getRepo: async (repoId) => {
    const { githubApolloFetch } = await createGithubClients()
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
            isArchived
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
    const { githubApolloFetch } = await createGithubClients()
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
  getCommit: async (repo, { id: sha }, { redis }) => {
    const redisKey = `repos:${repo.id}/commits/${sha}`
    const redisCommit = await redis.getAsync(redisKey)
    redis.expireAsync(redisKey, redis.__defaultExpireSeconds)
    if (redisCommit) {
      debug('commit: redis HIT (%s)', redisKey)
      return JSON.parse(redisCommit)
    }
    debug('commit: redis MISS (%s)', redisKey)

    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repo.id.split('/')
    const {
      data: {
        repository: {
          object: rawCommit
        }
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $sha: GitObjectID!
        ) {
          repository(
            owner: $login
            name: $repoName
          ) {
            object(oid: $sha) {
              ... on Commit {
                oid
                author {
                  email
                  name
                }
                parents (first: 5){
                  nodes {
                    oid
                  }
                }
                message
                committedDate
              }
            }
          }
        }
      `,
      variables: {
        login,
        repoName,
        sha
      }
    })
    if (!rawCommit) {
      return null
    }
    const commit = normalizeGQLCommit(repo, rawCommit)
    await redis.setAsync(redisKey, JSON.stringify(commit), 'EX', redis.__defaultExpireSeconds)
    return commit
  },
  getCommits: async (repo, { first = 15, after, before }) => {
    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repo.id.split('/')
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
          $maxRefs: Int
          $maxCommits: Int,
          $commitsSince: GitTimestamp,
          $commitsUntil: GitTimestamp
        ) {
          repository(
            owner: $login
            name: $repoName
          ) {
            refs(refPrefix: "refs/heads/", first: $maxRefs) {
              nodes {
                name
                target {
                  ... on Commit {
                    oid
                    author {
                      date
                    },
                    history(first: $maxCommits, until: $commitsUntil, since: $commitsSince) {
                      pageInfo {
                        hasNextPage
                      }
                      totalCount
                      nodes {
                        ... on Commit {
                          oid
                          author {
                            email
                            name
                          }
                          parents (first: 5){
                            nodes {
                              oid
                            }
                          }
                          message
                          committedDate
                        }
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
        maxRefs: 100,
        maxCommits: first,
        commitsSince: before,
        commitsUntil: after
      }
    })
    const hasNextPage = heads.some(({target}) => target.history.pageInfo.hasNextPage)
    const totalCount = heads.reduce((total, {target}) => total + target.history.totalCount, 0)

    const commits = heads
      .map(({ target }) =>
        target.history.nodes
          .map(
            commit => normalizeGQLCommit(repo, commit)
          )
      )
      .reduce(
        (acc, v) => acc.concat(v), []
      )
      .filter((v, i, arr) => arr.findIndex(mapObj => mapObj.id === v.id) === i)
      .sort((a, b) => descending(a.date, b.date))
      .slice(0, first)

    return {
      pageInfo: {
        endCursor: (commits.length && commits.slice(-1)[0].date) || null,
        startCursor: (commits.length && commits[0].date) || null,
        hasNextPage: hasNextPage || commits.length > first
      },
      totalCount,
      nodes: commits
    }
  },
  getAnnotatedTags: async (repoId, first = 100) => {
    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repoId.split('/')

    const getAll = (after = null, nodesArray = []) => {
      return githubApolloFetch({
        query: `
          query repository(
            $login: String!,
            $repoName: String!,
            $first: Int,
            $after: String
          ) {
            repository(owner: $login, name: $repoName) {
              refs(refPrefix: "refs/tags/", first: $first, after: $after) {
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
        .catch(errors => { console.log(errors) })
    }

    return getAll()
      .then(tags => tags
        .map(tag => tag.target)
        .filter(tag => Object.keys(tag).length > 0) // only annotated
        .map(tag => tagNormalizer(tag, repoId))
      )
      .then(tags =>
        uniqWith(tags, (a, b) => a.name === b.name)
      )
  },
  getAnnotatedTag: async (repoId, tagName) => {
    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repoId.split('/')
    const {
      data: {
        repository: {
          ref
        }
      }
    } = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $ref: String!
        ) {
          repository(owner: $login, name: $repoName) {
            ref(qualifiedName: $ref) {
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
      `,
      variables: {
        login,
        repoName,
        ref: `refs/tags/${tagName}`
      }
    })
    if (!ref || !ref.target) {
      return null
    }
    return tagNormalizer(ref.target, repoId, tagName)
  },
  upsertRef: async (repoId, ref, sha) => {
    const [login, repoName] = repoId.split('/')
    const { githubRest } = await createGithubClients()

    return githubRest.gitdata.updateRef({
      owner: login,
      repo: repoName,
      ref,
      sha
    })
      .catch(e => {
        if (e.message === 'Reference does not exist') {
          return githubRest.gitdata.createRef({
            owner: login,
            repo: repoName,
            ref: `refs/${ref}`,
            sha
          })
        }
        console.error(e)
        return e
      })
  },
  deleteRef: async (repoId, ref, silent) => {
    const [login, repoName] = repoId.split('/')
    const { githubRest } = await createGithubClients()
    return githubRest.gitdata.deleteRef({
      owner: login,
      repo: repoName,
      ref
    })
      .catch(errors => {
        if (!silent) {
          console.log(errors)
        }
      })
  },
  archiveRepo: async (repoId) => {
    const [login, repoName] = repoId.split('/')
    const { githubRest } = await createGithubClients()
    return githubRest.repos.update({
      owner: login,
      repo: repoName,
      name: repoName,
      archived: true
    })
  }
}
