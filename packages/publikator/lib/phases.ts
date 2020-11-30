const debug = require('debug')('publikator:lib:phases')

interface Phase {
  key: string
  color: string
  lock: boolean
  fallback?: boolean
  tags?: string[]
  published?: boolean
  scheduled?: boolean
  live?: boolean
}

interface RepoLatestPublication {
  name: string
  prepublication: boolean
  live: boolean
  meta: {
    scheduledAt?: Date
  }
}

interface Repo {
  id: number
  latestPublications: RepoLatestPublication[]
  tags: {
    nodes: { name: string }[]
  }
}

interface CheckPredicate {
  (repo: Repo): boolean
}

interface Check {
  name: string
  conditions: boolean
  expected: boolean
  predicate: CheckPredicate
}

const phases: Phase[] = [
  {
    key: 'draft',
    color: 'Indigo',
    lock: false,
    fallback: true,
    tags: [],
  },
  {
    key: 'creation',
    color: 'Gold',
    lock: false,
    tags: ['startCreation'],
  },
  {
    key: 'finalEditing',
    color: 'Orange',
    lock: false,
    tags: ['finalEditing'],
  },
  {
    key: 'cr',
    color: 'Chocolate',
    lock: false,
    tags: ['startCR'],
  },
  {
    key: 'production',
    color: 'Tomato',
    lock: true,
    tags: ['startProduction'],
  },
  {
    key: 'proofReading',
    color: 'HotPink',
    lock: true,
    tags: ['startProofReading'],
  },
  {
    key: 'finalControl',
    color: 'Fuchsia',
    lock: true,
    tags: ['proofReadingOk'],
  },
  {
    key: 'ready',
    color: 'MediumSeaGreen',
    lock: true,
    tags: [
      'proofReadingOk',
      'numbersOk',
      'imagesOk',
      'factCheckOk',
      'finalControl',
    ],
  },
  {
    key: 'scheduled',
    color: 'Turquoise',
    lock: true,
    published: true,
    scheduled: true,
  },
  {
    key: 'published',
    color: 'RoyalBlue',
    lock: true,
    published: true,
    live: true,
  },
]

if (!phases.find((p) => p.fallback)) {
  throw new Error('At least one phase needs fallback flag')
}

const maybeCheckTags = function (phase: Phase): Check {
  return {
    name: 'tags',
    conditions: !!phase.tags,
    expected: true,
    predicate: (repo: Repo) =>
      !!phase.tags?.every(
        (tag) => !!repo.tags?.nodes?.find((n) => n.name === tag),
      ),
  }
}

const maybeCheckPublished = function (phase: Phase): Check {
  return {
    name: 'published',
    conditions: typeof phase.published === 'boolean',
    expected: !!phase.published,
    predicate: (repo: Repo) => !!repo.latestPublications.length,
  }
}

const maybeCheckScheduled = function (phase: Phase): Check {
  return {
    name: 'scheduled',
    conditions: typeof phase.scheduled === 'boolean',
    expected: !!phase.scheduled,
    predicate: (repo: Repo) =>
      !!repo.latestPublications.find(
        (p) =>
          p.meta.scheduledAt &&
          !p.live &&
          p.name.indexOf('prepublication') === -1,
      ),
  }
}

const maybeCheckLive = function (phase: Phase): Check {
  return {
    name: 'live',
    conditions: typeof phase.live === 'boolean',
    expected: !!phase.live,
    predicate: (repo: Repo) =>
      !!repo.latestPublications.find(
        (p) => p.live && p.name.indexOf('prepublication') === -1,
      ),
  }
}

const runChecks = (repo: Repo, checks: Check[]) => {
  const hasAllPassed = checks
    .filter((check) => check.conditions)
    .every((check) => {
      const { name, expected, predicate } = check
      const hasPassed = expected === predicate(repo)

      debug('runChecks', { repo: repo.id, name, hasPassed })
      return hasPassed
    })

  debug('runChecks', { repo: repo.id, checks: checks.length, hasAllPassed })

  return hasAllPassed
}

const getPhases = () => [...phases]

const hasReachedPhase = (repo: Repo, phase: Phase) => {
  const checks: Check[] = [
    maybeCheckTags(phase),
    maybeCheckPublished(phase),
    maybeCheckScheduled(phase),
    maybeCheckLive(phase),
  ]

  const hasReached = !!runChecks(repo, checks)
  debug('hasReachedPhase', { repo: repo.id, phase: phase.key, hasReached })

  return hasReached
}

const getCurrentPhase = (repo: Repo) => {
  const phases = getPhases().reverse()
  const currentPhase = phases.find((phase) => hasReachedPhase(repo, phase))
  if (!currentPhase) {
    throw new Error(
      `Failing to determine current phase repo "${repo.id}" is in`,
    )
  }

  debug('getCurrentPhase', { repo: repo.id, phase: currentPhase.key })

  return currentPhase
}

const getPhase = (key: string) => {
  return getPhases().find((phase) => phase.key === key)
}

const getFallbackPhase = () => {
  return getPhases().find((phase) => phase.fallback)
}

module.exports = {
  getPhases,
  getCurrentPhase,
  getPhase,
  getFallbackPhase,
}
