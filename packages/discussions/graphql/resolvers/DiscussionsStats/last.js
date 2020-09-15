const { createCache } = require('../../../lib/stats/last')

module.exports = async (_, args, context) => {
  // Fetch pre-populated data
  const data = await createCache(context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for DiscussionsStats.last',
    )
  }

  // Retrieve pre-populated data.
  const { result, updatedAt, key } = data

  return {
    ...result,
    updatedAt,
    key,
  }
}
