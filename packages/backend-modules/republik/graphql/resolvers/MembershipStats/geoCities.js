const { createCache } = require('../../../lib/MembershipStats/geoCities')

module.exports = async (_, args, context) => {
  // Fetch pre-populated data
  const data = await createCache(context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for MembershipStats.geoCities',
    )
  }

  // Retrieve pre-populated data.
  const { result: buckets = [], updatedAt = new Date() } = data

  return {
    buckets,
    updatedAt,
  }
}
