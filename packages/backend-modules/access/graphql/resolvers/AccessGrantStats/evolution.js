const moment = require('moment')

const { createCache } = require('../../../lib/AccessGrantStats/evolution')

module.exports = async (_, args, context) => {
  // Fetch pre-populated data
  const data = await createCache(context).get()

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for AccessGrantStats.evolution',
    )
  }

  // Retrieve pre-populated data.
  const { result = [], updatedAt = new Date() } = data

  // A list of desired bucket keys to return
  const keys = []

  // Add keys to bucket keys due to arguments
  for (
    const date = moment(args.min).clone(); // Start with {min}, beginning of months
    date <= moment(args.max); // Loop while date is lower than {max}
    date.add(1, 'day') // Add month to {date} before next loop
  ) {
    keys.push(date.format('YYYY-MM-DD'))
  }

  return {
    buckets: result
      .filter(
        ({ accessCampaignId }) => accessCampaignId === args.accessCampaignId,
      )
      .filter(({ key }) => keys.includes(key)),
    updatedAt,
  }
}
