import Debug from 'debug'

const debug = Debug('publikator:lib:phases')

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

interface Milestone {
  scope: 'milestone' | 'publication' | 'prepublication'
  name: string
  createdAt: Date
  scheduledAt?: Date
  publishedAt?: Date
  revokedAt?: Date
}

interface Repo {
  id: string
}

interface CheckPredicate {
  (milestones: Milestone[]): boolean
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
    scheduled: false,
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
    predicate: (milestones) =>
      !!phase.tags?.every(
        (tag) =>
          !!milestones.find((m) => m.scope === 'milestone' && m.name === tag),
      ),
  }
}

const maybeCheckPublished = function (phase: Phase): Check {
  return {
    name: 'published',
    conditions: typeof phase.published === 'boolean',
    expected: !!phase.published,
    predicate: (milestones) =>
      !!milestones.find((m) => m.scope === 'publication' && !m.revokedAt),
  }
}

const maybeCheckScheduled = function (phase: Phase): Check {
  return {
    name: 'scheduled',
    conditions: typeof phase.scheduled === 'boolean',
    expected: !!phase.scheduled,
    predicate: (milestones) =>
      !!milestones.find(
        (m) =>
          m.scope === 'publication' &&
          m.scheduledAt &&
          !m.publishedAt &&
          !m.revokedAt,
      ),
  }
}

const maybeCheckLive = function (phase: Phase): Check {
  return {
    name: 'live',
    conditions: typeof phase.live === 'boolean',
    expected: !!phase.live,
    predicate: (milestones) =>
      !!milestones.find(
        (m) => m.scope === 'publication' && m.publishedAt && !m.revokedAt,
      ),
  }
}

const runChecks = (repo: Repo, milestones: Milestone[], checks: Check[]) => {
  const hasAllPassed = checks
    .filter((check) => check.conditions)
    .every((check) => {
      const { name, expected, predicate } = check
      const hasPassed = expected === predicate(milestones)

      debug('runChecks', { repo: repo.id, name, hasPassed })
      return hasPassed
    })

  debug('runChecks', { repo: repo.id, checks: checks.length, hasAllPassed })

  return hasAllPassed
}

const getPhases = () => [...phases]

const hasReachedPhase = (repo: Repo, milestones: Milestone[], phase: Phase) => {
  const checks: Check[] = [
    maybeCheckTags(phase),
    maybeCheckPublished(phase),
    maybeCheckScheduled(phase),
    maybeCheckLive(phase),
  ]

  const hasReached = !!runChecks(repo, milestones, checks)
  debug('hasReachedPhase', { repo: repo.id, phase: phase.key, hasReached })

  return hasReached
}

const getCurrentPhase = (repo: Repo, milestones: Milestone[]) => {
  const phases = getPhases().reverse()
  const currentPhase = phases.find((phase) =>
    hasReachedPhase(repo, milestones, phase),
  )
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
