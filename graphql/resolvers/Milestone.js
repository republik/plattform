const github = require('../../lib/github')
module.exports = {
  commit: async (milestone, args, { user }) => {
    return github.getCommit(
      user.githubAccessToken,
      milestone.repoId,
      milestone.commit.id
    )
      .then(commit => ({
        ...commit,
        id: commit.sha,
        date: new Date(commit.author.date),
        repo: {
          id: milestone.repoId
        },
        parentIds: commit.parents
          ? commit.parents.map(parent => parent.sha)
          : []
      }))
  }
}
