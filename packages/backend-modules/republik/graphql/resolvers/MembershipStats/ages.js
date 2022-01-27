const { createCache } = require('../../../lib/MembershipStats/ages')

module.exports = async (_, args, context) => {
  // Fetch pre-populated data
  const data = await createCache(context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for MembershipStats.ages',
    )
  }

  // Retrieve pre-populated data.
  const { averageAge, result: buckets = [], updatedAt = new Date() } = data

  return {
    averageAge,
    buckets,
    updatedAt,
  }
}
