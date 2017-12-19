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
const { transformUser } = require('@orbiting/backend-modules-auth')
const debug = require('debug')('publikator:repo')

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
    if (repo.latestCommit) {
      return repo.latestCommit
    }
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
  commit: async (repo, { id: sha }, { redis }) => {
    const redisKey = `repos:${repo.id}/commits/${sha}`
    const redisCommit = await redis.getAsync(redisKey)
    if (redisCommit) {
      debug('commit: redis HIT (%s)', redisKey)
      return JSON.parse(redisCommit)
    }
    debug('commit: redis MISS (%s)', redisKey)

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
    .then(async (commit) => {
      await redis.setAsync(redisKey, JSON.stringify(commit))
      return commit
    })
  },
  uncommittedChanges: async (
    { id: repoId },
    args,
    { redis, pgdb }
  ) => {
    const userIds = await redis.zrangeAsync(repoId, 0, -1)
    return userIds.length
      ? pgdb.public.users.find({ id: userIds })
          .then(users => users.map(transformUser))
      : []
  },
  milestones: (repo) => {
    if (repo.tags && repo.tags.nodes) { // repos query
      return repo.tags.nodes
    }
    debug('milestones needs to query getAnnotatedTags repo %O', repo)
    return getAnnotatedTags(repo.id)
  },
  latestPublications: async (repo) => {
    const {
      id: repoId
    } = repo
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

    if (!repo.latestPublications) {
      debug('latestPublications needs getAnnotatedTag for repo %O', repo)
    }

    // repos query gets the refs for us
    let annotatedTags = repo.latestPublications
      ? repo.latestPublications
      : await Promise.all(
        refs.map(ref => getAnnotatedTag(repoId, ref))
      )

    return Promise.all(
      annotatedTags
    )
      .then(tags => tags
        .filter(tag => !!tag)
        .map(tag => ({
          ...tag,
          sha: tag.oid,
          live: liveRefs.indexOf(tag.refName) > -1
        })
        )
      )
      .then(tags => uniqBy(tags, 'name'))
      .then(tags => tags
        .map(tag => publicationMetaDecorator(tag))
      )
  },
  meta: async (repo) => {
    let message
    if (repo.meta) {
      return repo.meta
    } else if (repo.metaTag !== undefined) {
      message = repo.metaTag && repo.metaTag.target
        ? repo.metaTag.target.message
        : ''
    } else {
      debug('meta needs to query tag for repo %O', repo)
      const tag = await getAnnotatedTag(
        repo.id,
        'meta'
      )
      message = tag.message
    }
    if (!message || message.length === 0) {
      return {}
    }
    return yaml.parse(message)
  }
}
