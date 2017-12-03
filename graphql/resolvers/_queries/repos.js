const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { createGithubClients } = require('../../../lib/github')
const { descending, ascending } = require('d3-array')
const _ = {
  get: require('lodash/get')
}

const {
  commit: getCommit,
  meta: getMeta
} = require('../Repo')
const { document: getDocument } = require('../Commit')

const {
  GITHUB_LOGIN,
  REPOS_NAME_FILTER
} = process.env

module.exports = async (__, args, { user }) => {
  ensureUserHasRole(user, 'editor')
  const { githubApolloFetch } = await createGithubClients()

  const {
    first = 100,
    orderBy,
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
        $orderByDirection: OrderDirection!
      ) {
        repositoryOwner(login: $login) {
          repositories(
            first: $first,
            orderBy: {
              field: PUSHED_AT,
              direction: $orderByDirection
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
      first,
      orderByDirection: orderBy
        ? orderBy.direction
        : 'DESC'
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
      meta: await getMeta(repo),
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

  // PUSHED_AT is done by github, see query above
  if (orderBy && orderBy.field !== 'PUSHED_AT') {
    const ascDesc = orderBy.direction === 'ASC'
      ? ascending
      : descending
    let selector
    switch (orderBy.field) {
      case 'CREATION_DEADLINE':
        selector = 'meta.creationDeadline'
        break
      case 'PRODUCTION_DEADLINE':
        selector = 'meta.productionDeadline'
        break
      case 'PUBLISHED_AT':
        selector = 'latestCommit.document.meta.publishDate'
        break
      default:
        throw new Error(`missing selector for orderBy.field: ${orderBy.field}`)
    }
    repos = repos.sort((a, b) => ascDesc(_.get(a, selector), _.get(b, selector)))
  }

  return repos
}
