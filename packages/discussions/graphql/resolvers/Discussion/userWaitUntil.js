module.exports = async ({ minInterval, id }, _, context) => {
  const { pgdb, user, loaders } = context

  if (!user) {
    return null
  }

  const suspensions = await loaders.DiscussionSuspension.byUserId.load(user.id)
  if (suspensions.length) {
    const until = Math.max(...suspensions.map((s) => s.endAt))
    return new Date(until)
  }

  if (!minInterval) {
    return null
  }
  const now = new Date().getTime()
  const lastCommentByUser = await pgdb.public.comments.findFirst(
    {
      userId: user.id,
      discussionId: id,
      published: true,
    },
    {
      orderBy: ['createdAt desc'],
    },
  )
  if (!lastCommentByUser) {
    return null
  }
  const nextPossibleTimestamp =
    lastCommentByUser.createdAt.getTime() + minInterval
  return nextPossibleTimestamp > now ? new Date(nextPossibleTimestamp) : null
}
