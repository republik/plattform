module.exports = async (_, context) => {
  const { user, loaders } = context

  if (!user) {
    return null
  }

  const suspensions = await loaders.DiscussionSuspension.byUserId.load(user.id)
  if (suspensions.length) {
    const until = Math.max(...suspensions.map((s) => s.endAt))
    return new Date(until)
  }

  return null
}
