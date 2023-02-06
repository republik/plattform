const Promise = require('bluebird')

const { resolvePackages, getCustomOptions } = require('./CustomPackages')

const getCustomPackages = async ({ user, crowdfundingName, pgdb }) => {
  const now = new Date()

  const crowdfundings = crowdfundingName
    ? await pgdb.public.crowdfundings.find({
        name: crowdfundingName,
        'beginDate <=': now,
        'endDate >': now,
      })
    : await pgdb.public.crowdfundings.find({
        'beginDate <=': now,
        'endDate >': now,
      })

  const packages = await pgdb.public.packages.find({
    crowdfundingId: crowdfundings.map((crowdfunding) => crowdfunding.id),
    custom: true,
  })

  if (packages.length === 0) {
    return []
  }

  return Promise.map(
    await resolvePackages({ packages, pledger: user, strict: true, pgdb }),
    getCustomOptions,
  ).filter(Boolean)
}

const getFutureCampaignAboCount = async ({ user, pgdb }) => {
  const currentCount = await pgdb.public.userAttributes.findFirst(
    { userId: user.id, name: 'futureCampaignAboCount' },
    { orderBy: { createdAt: 'desc' } },
  )

  return currentCount ? parseInt(currentCount.value, 10) : 0
}

module.exports = {
  getCustomPackages,
  getFutureCampaignAboCount,
}
