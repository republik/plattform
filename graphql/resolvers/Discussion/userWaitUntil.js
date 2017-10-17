module.exports = async (discussion, _, { pgdb, user }) => {
  if (!discussion.minInterval) {
    return null
  }
  const now = new Date().getTime()
  const lastCommentByUser = await pgdb.public.comments.findFirst({
    userId: user.id,
    discussionId: discussion.id,
    published: true
  }, {
    orderBy: ['createdAt desc']
  })
  if (!lastCommentByUser) {
    return null
  }
  const nextPossibleTimestamp = lastCommentByUser.createdAt.getTime() + discussion.minInterval
  return nextPossibleTimestamp > now
    ? new Date(nextPossibleTimestamp)
    : null
}
