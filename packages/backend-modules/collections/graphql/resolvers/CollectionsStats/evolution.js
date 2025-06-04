const moment = require('moment')

module.exports = async (_, args, context) => {
  const { name } = args

  const collection = await context.loaders.Collection.byKeyObj.load({ name })

  if (!collection) {
    throw new Error(`Collection "${name}" not found`)
  }

  // Fetch pre-populated data
  const data = await context.pgdb.query(
    `select * from cockpit_collections_evolution where "collectionId" = :collectionId`,
    {
      collectionId: collection.id,
    },
  )

  // In case pre-populated data is not available...
  if (!data) {
    throw new Error(
      'Unable to retrieve pre-populated data for Collection.CollectionsStats.evolution',
    )
  }

  // A list of desired bucket keys to return
  const keys = []

  // Add keys to bucket keys due to arguments
  for (
    const date = moment(args.min).clone().startOf('month'); // Start with {min}, beginning of months
    date <= moment(args.max); // Loop while date is lower than {max}
    date.add(1, 'month') // Add month to {date} before next loop
  ) {
    keys.push(date.format('YYYY-MM'))
  }

  return {
    buckets: data.filter(({ key }) => keys.includes(key)),
    updatedAt: data[0]?.updatedAt || new Date(),
  }
}
