const slack = require('../../../lib/slack')

module.exports = async (_, args, context) => {
  const { user: me, t, loaders } = context
  const { userId, reason } = args

  const user = await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/reportUser/userNotFound'))
  }

  if (userId === me?.id) {
    throw new Error(t('api/reportUser/self'))
  }

  await slack.reportUser(me, user, reason)

  return true
}
