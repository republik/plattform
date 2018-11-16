const { Roles } = require('@orbiting/backend-modules-auth')
const getDiscussion = require('../_queries/discussion')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserIsInRoles(user, ['editor', 'admin'])

  const {
    id,
    closed
  } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    if (closed !== undefined) {
      await pgdb.public.discussions.updateOne(
        { id },
        { closed }
      )
    }

    await transaction.transactionCommit()

    return getDiscussion(null, { id: discussion.id }, { pgdb }, null)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
