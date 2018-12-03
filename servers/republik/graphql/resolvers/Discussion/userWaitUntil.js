const { DISCUSSION_BANS } = process.env

// arrayOf(Shape({"userId":String,"expire":String}))
let BANS = []
if (DISCUSSION_BANS) {
  try {
    BANS = BANS.concat(JSON.parse(DISCUSSION_BANS)).filter(Boolean)
  } catch (e) {
    console.warn('invalid DISCUSSION_BANS env, no bans will be active')
  }
}

module.exports = async ({ minInterval, id }, _, { pgdb, user }) => {
  if (!user) {
    return null
  }
  if (BANS.length) {
    const userBan = BANS.find(ban => ban.userId === user.id)
    if (userBan) {
      const expire = new Date(userBan.expire)
      if (new Date() < expire) {
        return expire
      }
    }
  }
  if (!minInterval) {
    return null
  }
  const now = new Date().getTime()
  const lastCommentByUser = await pgdb.public.comments.findFirst({
    userId: user.id,
    discussionId: id,
    published: true
  }, {
    orderBy: ['createdAt desc']
  })
  if (!lastCommentByUser) {
    return null
  }
  const nextPossibleTimestamp = lastCommentByUser.createdAt.getTime() + minInterval
  return nextPossibleTimestamp > now
    ? new Date(nextPossibleTimestamp)
    : null
}
