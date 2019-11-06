export const phases = [
  {
    key: 'draft',
    color: 'Indigo',
    milestones: []
  },
  {
    key: 'creation',
    color: 'Gold',
    milestones: ['startCreation']
  },
  {
    key: 'finalEditing',
    color: 'Orange',
    milestones: ['finalEditing']
  },
  {
    key: 'production',
    color: 'Tomato',
    milestones: ['startProduction']
  },
  {
    key: 'proofReading',
    color: 'HotPink',
    milestones: ['startProofReading']
  },
  {
    key: 'finalControl',
    color: 'Fuchsia',
    milestones: ['proofReadingOk']
  },
  {
    key: 'ready',
    color: 'MediumSeaGreen',
    milestones: [
      'proofReadingOk',
      'numbersOk',
      'imagesOk',
      'factCheckOk',
      'finalControl'
    ]
  },
  {
    key: 'scheduled',
    color: 'Turquoise',
    published: true,
    scheduled: true
  },
  {
    key: 'published',
    color: 'RoyalBlue',
    published: true,
    live: true
  }
]

export const milestoneNames = phases
  .reduce((all, phase) => all.concat(phase.milestones), [])
  .filter(Boolean)
  .filter((name, index, all) => all.indexOf(name) === index)
