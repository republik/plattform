const { createCache } = require('../../../lib/MembershipStats/names')

module.exports = async (_, args, context) => {
  const { first = 100 } = args

  // Fetch pre-populated data
  const data = await createCache(context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for MembershipStats.names',
    )
  }

  // Retrieve pre-populated data.
  const { result = [], updatedAt = new Date() } = data

  return {
    buckets: result.slice(0, first),
    updatedAt,
  }
}
