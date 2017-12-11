
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
    key: 'production',
    color: 'Tomato',
    milestones: ['startProduction']
  },
  {
    key: 'proofReading',
    color: 'HotPink',
    milestones: ['numbersOk', 'imagesOk', 'startProofReading']
  },
  {
    key: 'finalControl',
    color: 'Fuchsia',
    milestones: ['factCheckOk', 'proofReadingOk']
  },
  {
    key: 'ready',
    color: 'MediumSeaGreen',
    milestones: ['finalControl', 'chiefEditor']
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

export const milestoneNames = phases.reduce(
  (all, phase) => all.concat(phase.milestones),
  []
).filter(Boolean)
