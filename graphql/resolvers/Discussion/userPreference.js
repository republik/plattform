module.exports = async (discussion, _, { pgdb, user }) => {
  const userId = user.id
  const dp = await pgdb.public.discussionPreferences.findOne({
    discussionId: discussion.id,
    userId
  })
  if (!dp) {
    return dp
  }
  const credential = dp.credentialId
    ? await pgdb.public.credentials.findOne({
      id: dp.credentialId,
      userId
    })
    : null
  return {
    anonymity: dp.anonymous || false, // this is bogous!
    credential
  }
}
