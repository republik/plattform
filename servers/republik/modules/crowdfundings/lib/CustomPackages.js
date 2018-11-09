const debug = require('debug')('crowdfundings:lib:CustomPackages')
const moment = require('moment')

// But that one into database.
const EXTENABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

const evaluate = (package_, packageOption, membership) => {
  debug('evaluate')
  // Is membershipType i.O?

  const { membershipType, membershipPeriods } = membership
  const now = moment()

  const payload = {
    ...packageOption,
    templateId: packageOption.id,
    package: package_,
    id: [ packageOption.id, membership.id ].join('-'),
    customization: {
      membership,
      additionalPeriods: []
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
    debug('membership has no membershipPeriods')
    return false
  }

  // Has no membershipPeriod with beginDate in future
  // Only memberships with current or past membershipPeriods can be extended.
  if (
    membershipPeriods
      .filter(membershipPeriod => membershipPeriod.beginDate > now)
      .length > 0
  ) {
    debug('membershp has membershipPeriod in future')
    return false
  }

  /*
  e)  MISSING DATA — If membership.membershipType != option.membershipType
      - If true, indicate generation of new membership in customization
      payload, then proceed
  TODO
   */

  let endDate =
    membershipPeriods
      .map(p => p.endDate)
      .reduce(
        (accumulator, currentValue) => {
          if (!accumulator) {
            return currentValue
          }

          return currentValue > accumulator ? currentValue : accumulator
        }
      )

  // If endDate is in past, pushed to now.
  // This indicates that we're dealing with an expired membership.
  if (endDate < now) {
    endDate = now
  }

  // Add a regular period this packageOption would cause.
  // It is a mere suggestion. Dates may differ upon payment.

  const beginEnd = {
    beginDate: endDate,
    endDate: moment(endDate)
      .add(membershipType.intervalCount, membershipType.interval)
  }

  payload.customization.additionalPeriods.push({
    // id: '123',
    membershipId: membership.id,
    kind: 'REGULAR',
    // createdAt: now,
    // updatedAt: now,
    ...beginEnd
  })

  // Prepend some condition before adding that thingy.
  payload.customization.additionalPeriods.push({
    // id: '456',
    membershipId: membership.id,
    kind: 'BONUS',
    beginDate: beginEnd.endDate,
    endDate:
      moment(beginEnd.endDate)
        .add(moment.duration(moment('2019-01-16').diff(now)))
    // createdAt: now,
    // updatedAt: now
  })

  /*
  a)  OK Does user own membership, or pledge membership (ABO_GIVE)
      - If false, end and don't return package option
  b)  OK Can membershipType be extended
      - If false, end
  c)  OK Is membership active, or inactive and used (altered)
      - If false, end
  d)  OK Has no membershipPeriod with beginDate in future
      - If false, end

  xx

  f)  Has membership no notice of cancellation (optional)
      - If false, indicate revoking of cancellation, then proceed
  g)  Does current, last period end within next x days (optional)
      - If false, end and hence don't return packageOption
  h)  Is user or membership is eligible for bonusInterval
      - If true, add bonusInterval to customization payload, then proceed
  */

  return payload
}

const getCustomOptions = (package_) => {
  debug('getCustomOptions', package_.name, package_.id)
  debug('user', package_.user.id)

  const { packageOptions } = package_

  const results = []

  // TODO, Check if all data is available:
  /*
    package {
      user: {
        memberhips[] {
          membershipType
          membershipPeriods[]
        }
      }
      packageOptions[]
    }

   */

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
  evaluate,
  getCustomOptions
}
