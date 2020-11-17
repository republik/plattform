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

const getPhases = () => ([ ...phases])

const getReachedPhases = (repo) => getPhases().filter(phase => {
  const checks = []

  if (phase.tags) {
    checks.push({
      check: 'tags',
      expected: true,
      value: phase.tags.every(tag => !!repo.tags?.nodes?.find(node => node.name === tag))
    })
  }

  if ([true, false].includes(phase.published)) {
    checks.push({
      check: 'published',
      expected: phase.published,
      value: !!repo.latestPublications.length
    })
  }

  if ([true, false].includes(phase.scheduled)) {
    checks.push({
      check: 'scheduled',
      expected: phase.scheduled,
      value: !!repo.latestPublications.find(
        p => p.meta.scheduledAt && !p.live && p.name.indexOf('prepublication') === -1
      )
    })
  }

  if ([true, false].includes(phase.live)) {
    checks.push({
      check: 'live',
      expected: phase.live,
      value: !!repo.latestPublications.find(
        p => p.live && !p.prepublication
      )
    })
  }

  return checks.every(check => check.expected === check.value)
})

const getCurrentPhase = (repo) => getReachedPhases(repo).pop()

module.exports = {
  getPhases,
  getCurrentPhase
}
