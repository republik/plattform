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

const commitNormalizer = ({
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

module.exports = {
  gitAuthor,
  getRepos,
  publicationVersionRegex,
  createGithubClients,
  tagNormalizer,
  commitNormalizer,
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
    if (redisCommit) {
      debug('commit: redis HIT (%s)', redisKey)
      return JSON.parse(redisCommit)
    }
    debug('commit: redis MISS (%s)', redisKey)

    const { githubRest } = await createGithubClients()
    const [login, repoName] = repo.id.split('/')
    return githubRest.repos.getCommit({
      owner: login,
      repo: repoName,
      sha
    })
      .then(response => response ? response.data : response)
      .then(commit => commitNormalizer({
        ...commit,
        repo
      }))
      .then(async (commit) => {
        await redis.setAsync(redisKey, JSON.stringify(commit))
        return commit
      })
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

    return githubRest.gitdata.updateReference({
      owner: login,
      repo: repoName,
      ref,
      sha
    })
      .catch(e => {
        let error
        try {
          error = JSON.parse(e.message)
        } catch (e) {}
        if (error && error.message === 'Reference does not exist') {
          return githubRest.gitdata.createReference({
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
    return githubRest.gitdata.deleteReference({
      owner: login,
      repo: repoName,
      ref
    })
      .catch(errors => {
        if (!silent) {
          console.log(errors)
        }
      })
  }
}
