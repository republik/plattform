const Promise = require('bluebird')
const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')

const { latestPublications: getLatestPublications } = require('../Repo')
const { archiveRepo } = require('../../../lib/github')
const { upsert: repoCacheUpsert } = require('../../../lib/cache/upsert')

const unpublishMutation = require('./unpublish')

module.exports = async (
  _,
  { repoIds, unpublish = false },
  context
) => {
  const { user, pubsub, t } = context
  ensureUserHasRole(user, 'editor')

  await Promise.each(repoIds, async repoId => {
    const publications = await getLatestPublications({ id: repoId })

    if (publications.length > 0) {
      if (!unpublish) {
        // Unable to archive published repository. Unpublish first.
        throw new Error(t('api/archive/error/published', { repoId }))
      }

      await unpublishMutation(_, { repoId }, context)
    }

    await archiveRepo(repoId)

    await repoCacheUpsert({
      id: repoId,
      isArchived: true
    }, context)

    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId
      }
    })
  })

  return {
    nodes: repoIds.map(id => ({ id })),
    totalCount: repoIds.length,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  }
}
