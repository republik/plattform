
export const phases = [
  {
    key: 'draft',
    color: 'Indigo',
    milestones: []
  },
  {
    key: 'production',
    color: 'Tomato',
    milestones: ['journalist']
  },
  {
    key: 'ready',
    color: 'MediumSeaGreen',
    milestones: ['textEditor', 'managingEditor', 'imageEditor', 'proofReader', 'chiefEditor']
  },
  {
    key: 'scheduled',
    color: 'LightPink',
    published: true,
    scheduled: true
  },
  {
    key: 'published',
    color: 'HotPink',
    published: true,
    live: true
  }
]

export const milestoneNames = phases.reduce(
  (all, phase) => all.concat(phase.milestones),
  []
)
