
export const phases = [
  {
    name: 'Entwurf',
    color: 'Indigo',
    milestones: []
  },
  {
    name: 'Produktion',
    color: 'Tomato',
    milestones: ['journalist']
  },
  {
    name: 'Ready',
    color: 'MediumSeaGreen',
    milestones: ['textEditor', 'managingEditor', 'imageEditor', 'proofReader', 'chiefEditor']
  },
  {
    name: 'Terminiert',
    color: 'LightPink',
    published: true,
    scheduled: true
  },
  {
    name: 'Publiziert',
    color: 'HotPink',
    published: true,
    live: true
  }
]

export const milestoneNames = phases.reduce(
  (all, phase) => all.concat(phase.milestones),
  []
)
