module.exports = async (discussion, _, { loaders, user }) => {
  if (!user) {
    return null
  }

  const dp = await loaders.DiscussionPreferences.byUserIdAndDiscussionId.load({
    discussionId: discussion.id,
    userId: user.id,
  })

  if (!dp) {
    // return default
    return {
      anonymity: discussion.anonymity === 'ENFORCED',
    }
  }

  return {
    anonymity: dp.anonymous, // this naming is bogous!
    credential:
      dp?.credentialId && loaders.CredentialById.load(dp.credentialId),
    notifications: dp.notificationOption,
  }
}
