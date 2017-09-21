const createGithubClients = require('./clients')
const uniqWith = require('lodash/uniqWith')

const publicationVersionRegex = /^v(\d+)(-prepublication)?.*/

const tagNormalizer = (tag, repoId) => ({
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
})

module.exports = {
  publicationVersionRegex,
  createGithubClients,
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
  getAnnotatedTags: async (repoId, first = 100) => {
    const { githubApolloFetch } = await createGithubClients()
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
    return tagNormalizer(ref.target, repoId)
  },
  getTopics: async (repoId, first = 100) => {
    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repoId.split('/')
    const topics = await githubApolloFetch({
      query: `
        query repository(
          $login: String!,
          $repoName: String!,
          $first: Int!
        ) {
          repository(
            owner: $login
            name: $repoName
          ) {
            repositoryTopics(first: $first) {
              nodes {
                topic {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        login,
        repoName,
        first
      }
    })
      .then(response => response.data.repository.repositoryTopics.nodes)
      .then(nodes => nodes.length
        ? nodes.map(node => node.topic.name)
        : []
      )
      .catch(errors => { console.log(errors) })

    return topics
  },
  setTopics: async (repoId, topics) => {
    const [login, repoName] = repoId.split('/')
    const { githubRest } = await createGithubClients()

    return githubRest.repos.replaceTopics({
      owner: login,
      repo: repoName,
      names: topics
    })
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
