const { createCache } = require('../../../lib/stats/last')

module.exports = async (_, args, context) => {
  const { interval } = args

  // Fetch pre-populated data
  const data = await createCache({ key: interval }, context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error('Unable to retrieve pre-populated data for DiscussionsStats.last')
  }

  // Retrieve pre-populated data.
  const { updatedAt = new Date(), ...result } = data

  return {
    ...result,
    updatedAt
  }
}
