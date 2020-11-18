const debug = require('debug')('publikator:lib:phases')

const phases = [
  {
    key: 'draft',
    tags: []
  },
  {
    key: 'creation',
    tags: ['startCreation']
  },
  {
    key: 'finalEditing',
    tags: ['finalEditing']
  },
  {
    key: 'cr',
    tags: ['startCR']
  },
  {
    key: 'production',
    tags: ['startProduction']
  },
  {
    key: 'proofReading',
    tags: ['startProofReading']
  },
  {
    key: 'finalControl',
    tags: ['proofReadingOk']
  },
  {
    key: 'ready',
    tags: [
      'proofReadingOk',
      'numbersOk',
      'imagesOk',
      'factCheckOk',
      'finalControl'
    ]
  },
  {
    key: 'scheduled',
    published: true,
    scheduled: true
  },
  {
    key: 'published',
    published: true,
    live: true
  }
]

const maybeCheckTags = (phase) => {
  return phase.tags && {
    name: 'tags',
    expected: true,
    predicate: (repo) => phase.tags.every(
      tag => !!repo.tags?.nodes?.find(node => node.name === tag)
    )
  }
}

const maybeCheckPublished = (phase) => {
  return typeof phase.scheduled === 'boolean' && {
    name: 'published',
    expected: phase.published,
    predicate: (repo) => !!repo.latestPublications.length
  }
}

const maybeCheckScheduled = (phase) => {
  return typeof phase.scheduled === 'boolean' && {
    name: 'scheduled',
    expected: phase.scheduled,
    predicate: (repo) => !!repo.latestPublications.find(
      p => p.meta.scheduledAt && !p.live && p.name.indexOf('prepublication') === -1
    )
  }
}

const maybeCheckLive = (phase) => {
  return typeof phase.live === 'boolean' && {
    name: 'live',
    expected: phase.live,
    predicate: (repo) => !!repo.latestPublications.find(
      p => p.live && !p.prepublication
    )
  }
}

const runChecks = (repo, checks) => {
  const hasAllPassed = checks
    .filter(Boolean)
    .every(check => {
      const { name, expected, predicate } = check
      const hasPassed = expected === predicate(repo)

      debug('runChecks', { repo: repo.id, name, hasPassed })
      return hasPassed
    })

  debug('runChecks', { repo: repo.id, checks: checks.length, hasAllPassed })

  return hasAllPassed
}

const getPhases = () => ([ ...phases])

const hasReachedPhase = (repo, phase) => {
  const checks = [
    maybeCheckTags(phase),
    maybeCheckPublished(phase),
    maybeCheckScheduled(phase),
    maybeCheckLive(phase),
  ]

  const hasReached = !!runChecks(repo, checks)
  debug('hasReachedPhase', { repo: repo.id, phase: phase.key, hasReached })

  return hasReached
}

const getCurrentPhase = (repo) => {
  const phases = getPhases().reverse()
  const currentPhase = phases.find(phase => hasReachedPhase(repo, phase))
  if (!currentPhase) {
    throw new Error(`Failing to determine current phase repo "${repo.id}" is in`)
  }

  debug('getCurrentPhase', { repo: repo.id, phase: currentPhase.key })

  return currentPhase
}

module.exports = {
  getPhases,
  getCurrentPhase
}
