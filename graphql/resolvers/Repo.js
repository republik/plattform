const { descending } = require('d3-array')
const uniqBy = require('lodash/uniqBy')
const some = require('lodash/some')
const yaml = require('js-yaml')
const {
  createGithubClients,
  commitNormalizer,
  getHeads,
  getAnnotatedTags,
  publicationVersionRegex
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
    const sortedPublications = await getAnnotatedTags(repoId)
      .then(tags => tags
        .filter(tag => publicationVersionRegex.test(tag.name))
        .map(tag => {
          const matches = publicationVersionRegex.exec(tag.name)
          return {
            version: parseInt(matches[1]),
            isPrepublication: !!matches[2],
            tag
          }
        })
        .sort((a, b) => descending(a.version, b.version))
      )

    let latestPublication
    let latestPrepublication
    some(sortedPublications, (publication) => {
      if (!latestPublication && !publication.isPrepublication) {
        latestPublication = publication.tag
      }
      if (!latestPrepublication && publication.isPrepublication) {
        latestPrepublication = publication.tag
      }
      return !!latestPublication && !!latestPrepublication
    })

    const publicationMetaDecorator = (publication) => {
      let parsedMessage = {}
      try {
        const body = publication.message.match(/---\n([\s\S]*?)\n---/)[1] || ''
        parsedMessage = yaml.safeLoad(body)
      } catch (e) { }
      // default values
      const {
        scheduledAt = undefined,
        updateMailchimp = false
      } = parsedMessage
      return {
        ...publication,
        meta: {
          scheduledAt,
          updateMailchimp
        }
      }
    }

    return [
      latestPublication,
      latestPrepublication
    ]
      .filter(Boolean)
      .map(publication => publicationMetaDecorator(publication))
  }
}
