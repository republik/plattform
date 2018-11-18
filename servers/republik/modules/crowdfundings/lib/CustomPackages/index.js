const debug = require('debug')('crowdfundings:lib:CustomPackages')
const moment = require('moment')
const uuid = require('uuid/v4')
const Promise = require('bluebird')

const rules = require('./rules')

// Put that one into database.
const EXTENABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']

// Which options require you to own a membership?
const OPTIONS_REQUIRE_CLAIMER = ['BENEFACTOR_ABO']

// Checks if user has at least one active and one inactive membership,
// considering latter as "dormant"
const hasDormantMembership = ({ package_, membership }) => {
  const { user } = package_
  const { memberships: allMemberships } = user

  const eligableMemberships = allMemberships.filter(
    m => m.userId === user.id && // user owns membership
      EXTENABLE_MEMBERSHIP_TYPES.includes(m.membershipType.name)
  )

  const hasInactiveMembership = !!eligableMemberships.find(
    m => m.active === false
  )

  return membership.active === true &&
    membership.userId === user.id &&
    hasInactiveMembership
}

const evaluate = async (package_, packageOption, membership) => {
  debug('evaluate')
  // Is membershipType i.O?

  if (hasDormantMembership({ package_, membership })) {
    debug('user has one or more dormant memberships')
    return false
  }

  const { reward } = packageOption
  const { membershipType, membershipPeriods } = membership
  const now = moment()

  const payload = {
    ...packageOption,
    templateId: packageOption.id,
    package: package_,
    id: [ packageOption.id, membership.id ].join('-'),
    customization: {
      membership,
      optionGroup: reward.type === 'MembershipType' ? membership.id : false,
      additionalPeriods: []
    }
  }

  // Can membership.membershipType be extended?
  // Not all membershipTypes can be extended
  if (!EXTENABLE_MEMBERSHIP_TYPES.includes(membershipType.name)) {
    debug('not extenable membershipType "%s"', membershipType.name)
    return false
  }

  // Check whether option requires user to be current claimer of membership.
  if (
    packageOption.membershipType &&
    OPTIONS_REQUIRE_CLAIMER.includes(packageOption.membershipType.name) &&
    membership.userId !== package_.user.id
  ) {
    debug(
      'only owner can extend membership w/ membershipType "%s"',
      packageOption.membershipType.name
    )
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
    id: uuid(), // TODO: Fake UUID, stitch together differently.
    membershipId: membership.id,
    kind: 'REGULAR',
    createdAt: now,
    updatedAt: now,
    ...beginEnd
  })

  // Applay package rules
  await Promise.each(package_.rules, rule => {
    if (rules[rule]) {
      return rules[rule]({ package_, packageOption, membership, payload, now })
    }
  })

  // If options is to extend membership, set defaultAmount to 1 if reward of
  // current packageOption evaluated is same as in evaluated membership.
  if (
    reward.type === 'MembershipType' &&
    membership.userId === package_.user.id
  ) {
    payload.defaultAmount =
      packageOption.rewardId === membershipType.rewardId ? 1 : 0
  }

  return payload
}

const getCustomOptions = async (package_) => {
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
  await Promise.map(package_.user.memberships, membership => {
    return Promise.map(packageOptions, async packageOption => {
      const result = await evaluate(package_, packageOption, membership)

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
