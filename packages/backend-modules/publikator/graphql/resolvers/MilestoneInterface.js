const { toCommit } = require('../../lib/postgres')

module.exports = {
  author: async (commit, args, context) => {
    const user =
      commit.userId && (await context.loaders.User.byId.load(commit.userId))

    if (user) {
      return {
        name: [user.firstName, user.lastName].join(' ').trim() || user.email,
        email: user.email,
        user,
      }
    }

    return {
      name: commit.author.name,
      email: commit.author.email,
    }
  },
  commit: async (milestone, args, context) => {
    const commit = await context.loaders.Commit.byId.load(milestone.commitId)
    return toCommit(commit)
  },
  date: (milestone) => milestone.createdAt,
}
