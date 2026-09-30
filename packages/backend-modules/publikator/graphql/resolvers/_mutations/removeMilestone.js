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
    const milestone = await tx.publikator.milestones.findOne({
      repoId,
      name,
    })

    if (!milestone) {
      throw new Error(`milestone "${name}" on ${repoId} does not exist`)
    }

    await tx.publikator.milestones.deleteOne({ id: milestone.id })

    await updateCurrentPhase(repoId, tx)

    await tx.transactionCommit()

    // @TODO: Safe to remove, once repoChange is adopted
    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId,
      },
    })

    await pubsub.publish('repoChange', {
      repoChange: {
        repoId,
        mutation: 'DELETED',
        milestone,
      },
    })

    return true
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
