const debug = require('debug')('publikator:mutation:placeMilestone')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')
const { updateCurrentPhase } = require('../../../lib/postgres')
const yaml = require('../../../lib/yaml')

// SANITY_SYNC (transition period, removable — see
// packages/backend-modules/sanity/lib/publikatorSync/index.ts)
const {
  isSyncFromPublikatorEnabled,
  enqueueSyncFromPublikator,
} = require('@orbiting/backend-modules-sanity')

module.exports = async (
  _,
  { repoId, commitId, name: _name, message, meta },
  context,
) => {
  const { user, pgdb, pubsub } = context
  ensureUserHasRole(user, 'editor')

  const name = _name.replace(/\s/g, '-')

  debug({ repoId, commitId, name, message, meta })

  const tx = await pgdb.transactionBegin()

  try {
    const hasMilestone = await tx.publikator.milestones.count({
      repoId,
      name,
    })

    if (hasMilestone) {
      throw new Error(`milestone "${name}" on ${repoId} exists already`)
    }

    const author = {
      name: user.name,
      email: user.email,
    }

    const milestone = await tx.publikator.milestones.insertAndGet({
      repoId,
      commitId,
      name,
      meta: meta || yaml.parse(message),
      userId: user.id,
      author,
      scope: 'milestone',
    })

    await updateCurrentPhase(repoId, tx)

    await tx.transactionCommit()

    // SANITY_SYNC (transition period, removable): a checklist sign-off isn't
    // itself a content commit, so without this it would sit un-mirrored in
    // Sanity's editorialSignOffs until the next unrelated commit/publish —
    // see editorialSignOffs.ts. Refreshes the draft only (action 'commit'),
    // matching editRepoMeta.js's own reasoning: a published article's live
    // Sanity copy stays as-is until the next real commit/publish.
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
        mutation: 'CREATED',
        milestone,
      },
    })

    return milestone
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
