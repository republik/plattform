const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { createGithubClients } = require('../../../lib/github')

const { commit: getCommit } = require('../Repo')
const { document: getDocument } = require('../Commit')

const {
  GITHUB_LOGIN,
  REPOS_NAME_FILTER
} = process.env

module.exports = async (_, args, { user }) => {
  ensureUserHasRole(user, 'editor')
  const { githubApolloFetch } = await createGithubClients()

  const {
    first = 100,
    milestonesFilters,
    formatFilter
  } = args

  const {
    data: {
      repositoryOwner: {
        repositories: {
          nodes: repositories
        }
      }
    }
  } = await githubApolloFetch({
    query: `
      query repositories(
        $login: String!
        $first: Int!
      ) {
        repositoryOwner(login: $login) {
          repositories(
            first: $first,
            orderBy: {
              field: PUSHED_AT,
              direction: DESC
            }
          ) {
            nodes {
              name
              defaultBranchRef {
                target {
                  ... on Commit {
                    oid
                  }
                }
              }
              metaTag: ref(qualifiedName: "refs/tags/meta") {
                target {
                  ... on Tag {
                    message
                  }
                }
              }
              tags: refs(refPrefix: "refs/tags/", first: 100) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      login: GITHUB_LOGIN,
      first
    }
  })

  let repos = await Promise.all(repositories.map(async (repository) => {
    const repo = {
      ...repository,
      id: `${GITHUB_LOGIN}/${repository.name}`
    }
    const latestCommit = await getCommit(repo, { id: repo.defaultBranchRef.target.oid })
    const document = await getDocument(latestCommit, { oneway: true }, { user })
    return {
      ...repo,
      latestCommit: {
        ...latestCommit,
        document
      }
    }
  }))

  if (milestonesFilters || formatFilter || REPOS_NAME_FILTER) {
    repos = repos.filter(repo => {
      if (formatFilter && (
        !repo.latestCommit.document ||
        !repo.latestCommit.document.meta ||
        !(repo.latestCommit.document.meta.format === formatFilter)
      )) {
        return false
      }
      if (REPOS_NAME_FILTER && repo.name.indexOf(REPOS_NAME_FILTER) === -1) {
        return false
      }
      if (milestonesFilters) {
        for (let milestoneFilter of milestonesFilters) {
          const tag = repo.tags.nodes.find(node => node.name === milestoneFilter.key)
          if ((milestoneFilter.value && !tag) || (!milestoneFilter.value && tag)) {
            return false
          }
        }
      }
      return true
    })
  }

  return repos
}
