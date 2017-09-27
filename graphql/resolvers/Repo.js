const { descending } = require('d3-array')
const uniqBy = require('lodash/uniqBy')
const yaml = require('../../lib/yaml')
const {
  createGithubClients,
  commitNormalizer,
  getHeads,
  getAnnotatedTags,
  getAnnotatedTag
} = require('../../lib/github')

module.exports = {
  commits: async (repo, { page }) => {
    const { githubRest } = await createGithubClients()
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
  latestCommit: async (repo) => {
    const { githubRest } = await createGithubClients()
    const [login, repoName] = repo.id.split('/')
    return getHeads(repo.id)
      .then(refs => refs
        .map(ref => ref.target)
        .sort((a, b) => descending(a.author.date, b.author.date))
        .shift()
      )
      .then(({ oid: sha }) =>
        githubRest.repos.getCommit({
          owner: login,
          repo: repoName,
          sha
        })
      )
      .then(response => response ? response.data : response)
      .then(commit => commitNormalizer({
        ...commit,
        repo
      }))
  },
  commit: async (repo, { id: sha }) => {
    const { githubRest } = await createGithubClients()
    const [login, repoName] = repo.id.split('/')
    return githubRest.repos.getCommit({
      owner: login,
      repo: repoName,
      sha
    })
    .then(response => response ? response.data : response)
    .then(commit => commitNormalizer({
      ...commit,
      repo
    }))
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
  ) => getAnnotatedTags(repoId),
  latestPublications: async (
    { id: repoId }
  ) => {
    const publicationMetaDecorator = (publication) => {
      const {
        scheduledAt = undefined,
        updateMailchimp = false
      } = yaml.parse(publication.message)
      return {
        ...publication,
        meta: {
          scheduledAt,
          updateMailchimp
        }
      }
    }

    const liveRefs = [
      'publication',
      'prepublication'
    ]
    const refs = [
      ...liveRefs,
      'scheduled-publication',
      'scheduled-prepublication'
    ]

    return Promise.all(
      refs.map(ref => getAnnotatedTag(repoId, ref)
        .then(tag => ({ tag, ref }))
      )
    )
      .then(objs => objs
        .filter(obj => !!obj.tag)
        .map(obj => ({
          ...obj.tag,
          sha: obj.tag.oid,
          live: liveRefs.indexOf(obj.ref) > -1
        })
        )
      )
      .then(tags => uniqBy(tags, 'name'))
      .then(tags => tags
        .map(tag => publicationMetaDecorator(tag))
      )
  }
}
