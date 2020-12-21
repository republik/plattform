module.exports = {
  user: (discussionSuspension, args, context) => {
    const { loaders } = context

    return loaders.User.byId.load(discussionSuspension.userId)
  },
}
