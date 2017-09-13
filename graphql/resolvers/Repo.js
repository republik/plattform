const { descending } = require('d3-array')
const uniqBy = require('lodash/uniqBy')
const {
  githubRest,
  commitNormalizer,
  getHeads,
  getTags
} = require('../../lib/github')

module.exports = {
  commits: async (repo, { page }, { user }) => {
    const refs = await getHeads(repo.id)

    const [login, repoName] = repo.id.split('/')
    return Promise.all(
      refs.map(({ target: { oid } }) => {
        return githubRest
          .repos.getCommits({
            owner: login,
            repo: repoName,
            sha: oid,
            per_page: 30,
            page: page || 1
          })
          .then(response => response ? response.data : response)
          .then(commits => commits
            .map(commit => commitNormalizer({
              ...commit,
              repo
            }))
          )
      })
    )
      .then(commits => [].concat.apply([], commits))
      .then(commits => uniqBy(commits, 'id'))
      .then(commits => commits.sort((a, b) => descending(a.date, b.date)))
  },
  uncommittedChanges: async (
    { id: repoId },
    args,
    { redis, pgdb }
  ) => {
    const userIds = await redis.zrangeAsync(repoId, 0, -1)
    return userIds.length
      ? pgdb.public.users.find({ id: userIds })
      : []
  },
  milestones: (
    { id: repoId }
  ) => getTags(repoId)
}
