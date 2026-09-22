const debug = require('debug')('publikator:mutation:removeMilestone')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { updateCurrentPhase } = require('../../../lib/postgres')

// SANITY_SYNC (transition period, removable — see
// packages/backend-modules/sanity/lib/publikatorSync/index.ts)
const {
  isSyncFromPublikatorEnabled,
  enqueueSyncFromPublikator,
} = require('@orbiting/backend-modules-sanity')

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

    // SANITY_SYNC (transition period, removable): see placeMilestone.js's
    // matching call — unchecking a checklist item must reach Sanity's
    // editorialSignOffs just as promptly as checking one does.
    if (isSyncFromPublikatorEnabled()) {
      await enqueueSyncFromPublikator({ repoId, action: 'commit' })
    }

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
