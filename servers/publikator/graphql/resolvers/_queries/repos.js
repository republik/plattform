const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { getRepos, tagNormalizer } = require('../../../lib/github')

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

  const {
    pageInfo,
    totalCount,
    totalDiskUsage,
    repositories
  } = await getRepos(args)

  const repos = await Promise.all(
    repositories
      .filter(repository => repository.defaultBranchRef) // skip uninitialized repos
      .filter(repository =>
        !REPOS_NAME_FILTER || !!REPOS_NAME_FILTER.split(',').find(name => repository.name.indexOf(name) > -1)
      )
      .map(async (repository) => {
        const repo = {
          ...repository,
          id: `${GITHUB_LOGIN}/${repository.name}`
        }

        const latestCommit = await getCommit(repo, { id: repo.defaultBranchRef.target.oid }, { redis })
        const document = await getDocument(latestCommit, { publicAssets: true }, { user, redis })
        return {
          ...repo,
          meta: await getMeta(repo),
          latestCommit: {
            ...latestCommit,
            document
          },
          latestPublications: [
            { refName: 'publication', ref: repo.publication },
            { refName: 'prepublication', ref: repo.prepublication },
            { refName: 'scheduled-publication', ref: repo.scheduledPublication },
            { refName: 'scheduled-prepublication', ref: repo.scheduledPrepublication }
          ]
            .filter(pub => pub.ref && pub.ref.target)
            .map(pub => tagNormalizer(pub.ref.target, repo.id, pub.refName))
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
