module.exports = async ({ minInterval, _id: id }, _, { pgdb, user }) => {
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
