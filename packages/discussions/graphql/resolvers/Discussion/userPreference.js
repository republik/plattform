module.exports = async (discussion, _, { pgdb, loaders, user }) => {
  if (!user) {
    return null
  }

  const userId = user.id
  const dp = await loaders.Discussion.Commenter.discussionPreferences.load({
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

  return {
    anonymity: dp.anonymous, // this naming is bogous!
    credential: dp.credential,
    notifications: dp.notificationOption
  }
}
