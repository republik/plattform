const slack = require('../../../lib/slack')

module.exports = async (_, args, context) => {
  const { user: me, t, loaders } = context
  const { userId, reason } = args

  const user = await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/reportUser/userNotFound'))
  }

  if (!me) {
    throw new Error(t('api/signIn'))
  }

  if (userId === me.id) {
    throw new Error(t('api/reportUser/self'))
  }

  await slack.reportUser(me?.name || me?.email || 'Gast', user, reason)

  return true
}
