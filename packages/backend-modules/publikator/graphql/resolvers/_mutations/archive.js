const debug = require('debug')('publikator:mutation:archive')
const Promise = require('bluebird')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')
const {
  lib: {
    Documents: { unpublish: unpublishDocument },
  },
} = require('@orbiting/backend-modules-search')

const { updateCurrentPhase } = require('../../../lib/postgres')

async function archiveRepo(repoId, unpublish, context) {
  const { t, pgdb, elastic, redis, pubsub } = context

  const publications =
    await context.loaders.Milestone.Publication.byRepoId.load(repoId)

  if (publications.length && !unpublish) {
    throw new Error(t('api/archive/error/published', { repoId }))
  }

  const tx = await pgdb.transactionBegin()

  try {
    const now = new Date()

    // unpublish
    const commits = await tx.publikator.commits.find(
      { repoId },
      { fields: ['id'] },
    )

    await tx.publikator.milestones.update(
      {
        commitId: commits.map((c) => c.id),
        scope: ['publication', 'prepublication'],
        revokedAt: null,
      },
      { revokedAt: now },
    )

    await unpublishDocument(elastic, redis, repoId)

    // Actual archiving
    await tx.publikator.repos.updateOne({ id: repoId }, { archivedAt: now })

    await updateCurrentPhase(repoId, tx)

    await tx.transactionCommit()

    await pubsub.publish('repoChange', {
      repoChange: {
        repoId,
        mutation: 'UPDATED',
        repo: await pgdb.publikator.repos.findOne({ id: repoId }),
      },
    })
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId })

    throw e
  }

  // @TODO: Safe to remove, once repoChange is adopted
  await pubsub.publish('repoUpdate', {
    repoUpdate: {
      id: repoId,
    },
  })
}

module.exports = async (_, { repoIds, unpublish = false }, context) => {
  const { user } = context
  ensureUserHasRole(user, 'editor')

  await Promise.map(repoIds, (repoId) =>
    archiveRepo(repoId, unpublish, context),
  )

  return {
    nodes: repoIds.map((id) => ({ id })),
    totalCount: repoIds.length,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}
