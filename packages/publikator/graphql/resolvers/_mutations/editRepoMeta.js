const debug = require('debug')('publikator:mutation:editRepoMeta')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { updateRepo } = require('../../../lib/postgres')

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

  try {
    const repo = await updateRepo(repoId, updatedMeta, tx)

    await tx.transactionCommit()

    return repo
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
