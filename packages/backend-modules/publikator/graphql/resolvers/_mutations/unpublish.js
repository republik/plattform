const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')
const debug = require('debug')('publikator:mutation:unpublish')

const { updateCurrentPhase } = require('../../../lib/postgres')

// SANITY_SYNC (transition period, removable — see
// packages/backend-modules/sanity/lib/publikatorSync/index.ts)
const {
  isSyncFromPublikatorEnabled,
  enqueueSyncFromPublikator,
} = require('@orbiting/backend-modules-sanity')

const { DISABLE_PUBLISH } = process.env

module.exports = async (_, { repoId }, context) => {
  const { user, t, pgdb, redis, elastic } = context
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
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }

  // SANITY_SYNC (transition period, removable): revert the mirrored Sanity
  // document from published back to a draft.
  if (isSyncFromPublikatorEnabled()) {
    await enqueueSyncFromPublikator({ repoId, action: 'unpublish' })
  }

  return true
}
