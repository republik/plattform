const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')
const debug = require('debug')('publikator:mutation:unpublish')

const { updateCurrentPhase } = require('../../../lib/postgres')

const { DISABLE_PUBLISH } = process.env

module.exports = async (_, { repoId }, context) => {
  const { user, t, pgdb, redis, elastic, pubsub } = context
  ensureUserHasRole(user, 'editor')

  if (DISABLE_PUBLISH) {
    throw new Error(t('api/publish/disabled'))
  }

  const now = new Date()

  const tx = await pgdb.transactionBegin()

  try {
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

    await updateCurrentPhase(repoId, tx)

    const {
      lib: {
        Documents: { unpublish },
      },
    } = require('@orbiting/backend-modules-search')

    await unpublish(elastic, redis, repoId)

    await tx.transactionCommit()

    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId,
      },
    })
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }

  return true
}
