const createGithubClients = require('./clients')

const publicationVersionRegex = /^v(\d+)(-prepublication)?.*/

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
  }
}
