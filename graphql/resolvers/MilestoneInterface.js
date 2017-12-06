const {
  commit: getCommit
} = require('./Repo')

module.exports = {
  commit: async (milestone, args, { user, redis }) => {
    return getCommit(milestone.repo, { id: milestone.commit.id }, { redis })
  }
}
