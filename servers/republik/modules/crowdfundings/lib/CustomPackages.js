const debug = require('debug')('crowdfundings:lib:CustomPackages')

// But that one into database.
const EXTENABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

const evaluate = (package_, packageOption, membership) => {
  debug('evaluate')
  // Is membershipType i.O?

  const { membershipType, membershipPeriods } = membership

  const payload = {
    ...packageOption,
    templateId: packageOption.id,
    package: package_,
    id: [ packageOption.id, membership.id ].join('-'),
    customization: {
      membership,
      additionalPeriods: []
      /* additionalPeriods: [
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
      ] */
    }
  }

  // Can membership.membershipType be extended?
  // Not all membershipTypes can be extended
  if (!EXTENABLE_MEMBERSHIP_TYPES.includes(membershipType.name)) {
    debug('not extenable membershipType "%s"', membershipType.name)
    return false
  }

  // Has membership any membershipPeriods?
  // Indicates whether a membership is or was active. Only those can be
  // extended.
  if (membershipPeriods.length === 0) {
    debug('membership inactive, no previous periods')
    return false
  }

  /* Object.assign(
    {},
    await membershipTypeExten
  ) */

  /*
  a)  OK Does user own membership, or pledge membership (ABO_GIVE)
      - If false, end and don't return package option
  b)  OK Can membershipType be extended
      - If false, end
  c)  OK Is membership active, or inactive and used (altered)
      - If false, end

  d)  Has no membershipPeriod with beginDate in future
      - If false, end
  e)  If membership.membershipType != option.membershipType
      - If true, indicate generation of new membership in customization
      payload, then proceed
  f)  Has membership no notice of cancellation (optional)
      - If false, indicate revoking of cancellation, then proceed
  g)  Does current, last period end within next x days (optional)
      - If false, end and hence don't return packageOption
  h)  Is user or membership is eligible for bonusInterval
      - If true, add bonusInterval to customization payload, then proceed
  */

  return payload
}

const getCustomOptions = (package_, packageOptions) => {
  debug('getCustomOptions', package_.name, package_.id)
  debug('user', package_.user.id)

  const results = []

  // per membership...
  package_.user.memberships.forEach((membership) => {
    // per package and it's regular options...
    packageOptions.forEach(packageOption => {
      const result = evaluate(package_, packageOption, membership)

      if (result) {
        results.push(result)
      }
    })
  })

  return results.filter(Boolean)
}

module.exports = {
  getCustomOptions
}
