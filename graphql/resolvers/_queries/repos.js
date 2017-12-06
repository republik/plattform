const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { createGithubClients } = require('../../../lib/github')

const {
  commit: getCommit,
  meta: getMeta
} = require('../Repo')
const { document: getDocument } = require('../Commit')

const {
  GITHUB_LOGIN,
  REPOS_NAME_FILTER
} = process.env

module.exports = async (__, args, { user, redis }) => {
  ensureUserHasRole(user, 'editor')
  const { githubApolloFetch } = await createGithubClients()

  const {
    data: {
      repositoryOwner: {
        repositories: {
          pageInfo,
          totalCount,
          totalDiskUsage,
          nodes: repositories
        }
      }
    }
  } = await githubApolloFetch({
    query: `
      query repositories(
        $login: String!
        $first: Int
        $last: Int
        $before: String
        $after: String
        $orderBy: RepositoryOrder
      ) {
        repositoryOwner(login: $login) {
          repositories(
            first: $first,
            last: $last,
            before: $before,
            after: $after,
            orderBy: $orderBy
          ) {
            pageInfo {
              endCursor,
              hasNextPage,
              hasPreviousPage,
              startCursor
            }
            totalCount
            totalDiskUsage
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
      ...args,
      login: GITHUB_LOGIN
    }
  })

  const repos = await Promise.all(
    repositories
      .filter(repository => repository.defaultBranchRef) // skip uninitialized repos
      .filter(repository => !REPOS_NAME_FILTER || repository.name.indexOf(REPOS_NAME_FILTER) > -1)
      .map(async (repository) => {
        const repo = {
          ...repository,
          id: `${GITHUB_LOGIN}/${repository.name}`
        }

        const latestCommit = await getCommit(repo, { id: repo.defaultBranchRef.target.oid }, { redis })
        const document = await getDocument(latestCommit, { oneway: true }, { user, redis })
        return {
          ...repo,
          meta: await getMeta(repo),
          latestCommit: {
            ...latestCommit,
            document
          }
        }
      }
    )
  )

  return {
    nodes: repos,
    pageInfo,
    totalCount,
    totalDiskUsage
  }
}
