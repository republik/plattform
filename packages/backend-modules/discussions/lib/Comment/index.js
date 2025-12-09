const featuredTargets = [
  { key: 'DEFAULT', default: true },
  { key: 'MARKETING' },
]

if (!featuredTargets.find((t) => t.default)) {
  throw new Error('At least one featuredTarget needs default flag')
}

const getFeaturedTargets = () => {
  return featuredTargets.map((t) => t.key)
}

const getDefaultFeaturedTarget = () => {
  return featuredTargets.find((t) => t.default)?.key
}

module.exports = {
  getFeaturedTargets,
  getDefaultFeaturedTarget,
  transform: require('./transform'),
  threadedComments: require('./threaded-comments'),
}
