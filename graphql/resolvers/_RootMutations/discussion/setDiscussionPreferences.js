const Roles = require('../../../../lib/Roles')
const setDiscussionPreferences = require('./lib/setDiscussionPreferences')
const userPreference = require('../../Discussion/userPreference')

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

    return userPreference(discussion, null, { pgdb, user })
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
