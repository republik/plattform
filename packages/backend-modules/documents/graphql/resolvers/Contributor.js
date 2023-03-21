module.exports = {
  user: async (contributor, _, context) => {
    if (!contributor?.userId) {
      return null
    }

    return context.loaders.User.byId.load(contributor?.userId)
  },
}
