const debug = require('debug')('crowdfundings:lib:CustomPackages')

const getCustomOptions = (package_, packageOptions) => {
  debug('getCustomOptions', package_.name, package_.id)
  debug('user', package_.user.id)

  const results = []

  // per membership...
  package_.user.memberships.forEach((membership) => {
    // per package and it's regular options...
    packageOptions.forEach(packageOption => {
      results.push({
        ...packageOption,
        templateId: packageOption.id,
        package: package_,
        id: [
          packageOption.id,
          membership.id
        ].join('-'),
        customization: {
          membership,
          additionalPeriods: [
            {
              id: 'fake',
              membershipId: membership.id,
              kind: 'REGULAR',
              beginDate: new Date(),
              endDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'total-fake',
              membershipId: membership.id,
              kind: 'BONUS',
              beginDate: new Date(),
              endDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        }
      })
    })
  })

  return results
}

module.exports = {
  getCustomOptions
}
