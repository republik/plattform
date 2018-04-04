module.exports = async (discussion, _, { pgdb, user }) => {
  if (!user) {
    return null
  }

  const userId = user.id
  const dp = await pgdb.public.discussionPreferences.findOne({
    discussionId: discussion.id,
    userId
  })
  if (!dp) { // return default
    const userCommented = !!(await pgdb.public.comments.findFirst({
      userId,
      discussionId: discussion.id
    }))
    return {
      anonymity: discussion.anonymity === 'ENFORCED',
      notifications: !userCommented
        ? 'NONE'
        : user._raw.defaultDiscussionNotificationOption
    }
  }

  const credential = dp.credentialId
    ? await pgdb.public.credentials.findOne({
      id: dp.credentialId,
      userId
    })
    : null
  return {
    anonymity: dp.anonymous, // this naming is bogous!
    credential,
    notifications: dp.notificationOption
  }
}
