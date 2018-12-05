const { Roles } = require('@orbiting/backend-modules-auth')
const setDiscussionPreferences = require('../../../lib/setDiscussionPreferences')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserHasRole(user, 'member')

  const {
    id,
    discussionPreferences
  } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    await setDiscussionPreferences({
      discussionPreferences,
      userId: user.id,
      discussion,
      transaction,
      t
    })

    await transaction.transactionCommit()

    return discussion
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
