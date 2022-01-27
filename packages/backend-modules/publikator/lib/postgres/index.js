const debug = require('debug')('publikator:lib:postgres')
const Promise = require('bluebird')

const { getCurrentPhase } = require('../phases')

const updateRepo = async function (repoId, meta, pgdb) {
  const existingMeta = await pgdb.publikator.repos.findOneFieldOnly(
    { id: repoId },
    'meta',
  )

  const updatedMeta = {
    ...existingMeta,
    ...meta,
  }

  const repo = await pgdb.publikator.repos.updateAndGetOne(
    { id: repoId },
    { meta: updatedMeta, updatedAt: new Date() },
  )

  return repo
}

const updateCurrentPhase = async function (repoId, pgdb) {
  const { repo, milestones } = await Promise.props({
    repo: pgdb.publikator.repos.findOne({ id: repoId }),
    milestones: pgdb.publikator.milestones.find({ repoId }),
  })

  const { key: currentPhase } = getCurrentPhase(repo, milestones)

  debug('updateCurrentPhase %s: %s', repoId, currentPhase)

  await pgdb.publikator.repos.update({ id: repoId }, { currentPhase })
}

const maybeDelcareMilestonePublished = async function (milestone, pgdb) {
  const { id } = milestone

  const now = new Date()

  const inFuture = milestone.scheduledAt > now

  if (!inFuture) {
    await pgdb.publikator.milestones.update({ id }, { publishedAt: now })
  }

  await pgdb.publikator.milestones.update(
    {
      repoId: milestone.repoId,
      'id !=': milestone.id,
      scope: [
        'prepublication',
        milestone.scope === 'publication' && 'publication',
      ].filter(Boolean),
      ...(inFuture && { publishedAt: null }),
      revokedAt: null,
    },
    { revokedAt: now },
  )
}

const toCommit = (commit) => {
  debug('toCommit', { commit })

  return {
    ...commit,
    date: commit.createdAt,
    repo: { id: commit.repoId },
  }
}

const publicationVersionRegex = /^v(\d+)(-prepublication)?.*/

module.exports = {
  updateRepo,
  updateCurrentPhase,
  maybeDelcareMilestonePublished,

  toCommit,

  publicationVersionRegex,
}
