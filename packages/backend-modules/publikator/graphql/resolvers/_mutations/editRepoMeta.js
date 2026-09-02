const debug = require('debug')('publikator:mutation:editRepoMeta')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { updateRepo } = require('../../../lib/postgres')

// SANITY_SYNC (transition period, removable — see
// packages/backend-modules/sanity/lib/publikatorSync/index.ts)
const {
  isSyncFromPublikatorEnabled,
  enqueueSyncFromPublikator,
} = require('@orbiting/backend-modules-sanity')

module.exports = async (_, args, context) => {
  const { user, pgdb } = context
  ensureUserHasRole(user, 'editor')

  const {
    repoId,
    creationDeadline,
    productionDeadline,
    publishDate,
    briefingUrl,
    mailchimpCampaignId,
    discussionId,
  } = args

  const updatedMeta = {
    ...(creationDeadline !== undefined && { creationDeadline }),
    ...(productionDeadline !== undefined && { productionDeadline }),
    ...(publishDate !== undefined && { publishDate }),
    ...(briefingUrl !== undefined && { briefingUrl }),
    ...(mailchimpCampaignId !== undefined && { mailchimpCampaignId }),
    ...(discussionId !== undefined && { discussionId }),
  }

  const tx = await pgdb.transactionBegin()

  let repo
  try {
    repo = await updateRepo(repoId, updatedMeta, tx)

    await tx.transactionCommit()
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }

  // SANITY_SYNC (transition period, removable): publishDate lives on the
  // *repo* record (repos.meta.publishDate), edited here independently of
  // any content commit — publish.js's own prepareMetaForPublish only sets
  // it once, if it isn't already set, so this is often how it's actually
  // planned/corrected. Without this, changing it here would silently never
  // reach the Sanity draft until the next unrelated commit happens to
  // trigger a sync. Refreshes the draft only (action 'commit') — if the
  // article is already published, its live Sanity copy stays as-is until
  // the next real commit or publish.
  if (isSyncFromPublikatorEnabled() && publishDate !== undefined) {
    await enqueueSyncFromPublikator({ repoId, action: 'commit' })
  }

  return repo
}
