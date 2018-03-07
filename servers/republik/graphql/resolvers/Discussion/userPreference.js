module.exports = async ({ id }, _, { pgdb, user }) => {
  if (!user) {
    return null
  }
  const userId = user.id
  const dp = await pgdb.public.discussionPreferences.findOne({
    discussionId: id,
    userId
  })
  if (!dp) {
    return null
  }
  const credential = dp.credentialId
    ? await pgdb.public.credentials.findOne({
      id: dp.credentialId,
      userId
    })
    : null
  return {
    anonymity: dp.anonymous || false, // this is bogous!
    credential,
    notifications: dp.notificationOption
  }
}
