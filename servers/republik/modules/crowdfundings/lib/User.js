const Promise = require('bluebird')

const {
  resolvePackages,
  getCustomOptions
} = require('./CustomPackages')

const getCustomPackages = async ({ user, crowdfundingName, pgdb }) => {
  const now = new Date()

  const crowdfundings = crowdfundingName
    ? await pgdb.public.crowdfundings.find({
      name: crowdfundingName,
      'beginDate <=': now,
      'endDate >': now
    })
    : await pgdb.public.crowdfundings.find({
      'beginDate <=': now,
      'endDate >': now
    })

  const packages = await pgdb.public.packages.find({
    crowdfundingId: crowdfundings.map(crowdfunding => crowdfunding.id),
    custom: true
  })

  if (packages.length === 0) {
    return []
  }

  return Promise
    .map(
      await resolvePackages({ packages, pledger: user, strict: true, pgdb }),
      async package_ => {
        if (package_.custom === true) {
          const options = await getCustomOptions(package_)

          if (options.length === 0) {
            return
          }

          return { ...package_, options }
        }

        return package_
      }
    )
    .filter(Boolean)
}

module.exports = {
  getCustomPackages
}
