const phases = require('../../lib/phases')
const zipArray = require('../../lib/zipArray')
const { toCommit } = require('../../lib/postgres')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  paginate: { paginator },
} = require('@orbiting/backend-modules-utils')
// const debug = require('debug')('publikator:repo')

const UNCOMMITTED_CHANGES_TTL = 7 * 24 * 60 * 60 * 1000 // 1 week in ms

module.exports = {
  commits: async (repo, args, context) => {
    const commits = await context.loaders.Commit.byRepoId.load(repo.id)

    return paginator(
      args,
      () => {},
      () => commits.map(toCommit),
    )
  },
  latestCommit: async (repo, args, context) => {
    const commit = await context.loaders.Commit.byRepoIdLatest.load(repo.id)
    return toCommit(commit)
  },
  commit: async (repo, args, context) => {
    const commit = await context.loaders.Commit.byId.load(args.id)
    return (commit?.repoId === repo.id && toCommit(commit)) || null
  },
  uncommittedChanges: async ({ id: repoId }, args, { redis, pgdb }) => {
    const minScore = new Date().getTime() - UNCOMMITTED_CHANGES_TTL
    const result = await redis
      .zrangeAsync(repoId, 0, -1, 'WITHSCORES')
      .then((objs) => zipArray(objs))
    redis.expireAsync(repoId, redis.__defaultExpireSeconds)
    const userIds = []
    const expiredUserIds = []
    for (const r of result) {
      if (r.score > minScore) {
        userIds.push(r.value)
      } else {
        expiredUserIds.push(r.value)
      }
    }
    await Promise.all(
      expiredUserIds.map((expiredKey) => redis.zremAsync(repoId, expiredKey)),
    )
    return userIds.length
      ? pgdb.public.users
          .find({ id: userIds })
          .then((users) => users.map(transformUser))
      : []
  },
  memos: async (repo, args, context) =>
    context.loaders.Memo.byRepoId.load(repo.id),
  milestones: (repo, args, context) =>
    context.loaders.Milestone.byRepoId.load(repo.id),
  latestPublications: (repo, args, context) =>
    context.loaders.Milestone.Publication.byRepoId.load(repo.id),
  meta: async (repo, args, context) => {
    const meta =
      repo.meta || (await context.loaders.Repo.byId.load(repo.id)).meta

    return meta
  },
  currentPhase: async (repo, args, context) => {
    const currentPhase =
      repo.currentPhase ||
      (await context.loaders.Repo.byId.load(repo.id)).currentPhase
    // A missing commit indicates a not yet created repository
    if (!currentPhase) {
      return phases.getFallbackPhase()
    }

    return phases.getPhase(currentPhase)
  },
  isArchived: async (repo) => !!repo.archivedAt,
  isTemplate: async (repo) => !!repo.meta?.isTemplate,
}
