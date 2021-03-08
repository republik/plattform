const debug = require('debug')('publikator:mutation:removeMilestone')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { updateCurrentPhase } = require('../../../lib/postgres')

module.exports = async (_, { repoId, name }, context) => {
  const { user, pgdb, pubsub } = context
  ensureUserHasRole(user, 'editor')

  debug({ repoId, name })

  const tx = await pgdb.transactionBegin()

  try {
    await tx.publikator.milestones.deleteOne({
      repoId,
      name,
    })

    await updateCurrentPhase(repoId, tx)

    await tx.transactionCommit()

    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId,
      },
    })

    return true
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
