const {
  createGithubClients,
  commitNormalizer,
  publicationVersionRegex
} = require('../../lib/github')

module.exports = {
  commit: async (milestone, args, { user }) => {
    const [login, repoName] = milestone.repo.id.split('/')
    const { githubRest } = await createGithubClients()

    return githubRest.repos.getCommit({
      owner: login,
      repo: repoName,
      sha: milestone.commit.id
    })
      .then(response => response.data)
      .then(commit => commitNormalizer({
        ...commit,
        repo: milestone.repo
      }))
  },
  immutable: async (milestone, args, { user }) =>
    publicationVersionRegex.test(milestone.name)
}
