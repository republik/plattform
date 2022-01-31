const Promise = require('bluebird')

const { resolvePackages, getCustomOptions } = require('./CustomPackages')

const getPackages = async ({ pledger, crowdfunding, custom, pgdb }) => {
  const now = new Date()

  const crowdfundings = crowdfunding
    ? [crowdfunding]
    : await pgdb.public.crowdfundings.find({
        'beginDate <=': now,
        'endDate >': now,
      })

  const packages = await pgdb.public.packages.find(
    {
      crowdfundingId: crowdfundings.map((crowdfunding) => crowdfunding.id),
      custom,
    },
    { skipUndefined: true }, // custom might be undefined
  )

  if (packages.length === 0) {
    return []
  }

  return Promise.map(
    resolvePackages({ packages, pledger, strict: true, pgdb }),
    getCustomOptions,
  ).filter(Boolean)
}

module.exports = {
  getPackages,
}
