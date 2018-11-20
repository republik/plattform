const debug = require('debug')('crowdfundings:lib:CustomPackages')
const moment = require('moment')
const uuid = require('uuid/v4')
const Promise = require('bluebird')

const { getLatestEndDate } = require('../utils')
const rules = require('./rules')

// Put that one into database.
const EXTENABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']
const EXTENABLE_PACKAGE_NAMES = ['ABO', 'BENEFACTOR']

// Which options require you to own a membership?
const OPTIONS_REQUIRE_CLAIMER = ['BENEFACTOR_ABO']

// Checks if user has at least one active and one inactive membership,
// considering latter as "dormant"
const hasDormantMembership = ({ package_, membership }) => {
  const { user } = package_
  const { memberships: allMemberships } = user

  const eligableMemberships = allMemberships.filter(
    m => m.userId === user.id && // user owns membership
      EXTENABLE_MEMBERSHIP_TYPES.includes(m.membershipType.name) &&
      EXTENABLE_PACKAGE_NAMES.includes(m.pledge.package.name)
  )

  const hasInactiveMembership = !!eligableMemberships.find(
    m => m.active === false
  )

  return membership.active === true &&
    membership.userId === user.id &&
    hasInactiveMembership
}

const evaluate = async ({ package_, packageOption, membership }) => {
  debug('evaluate')

  const { reward } = packageOption
  const { membershipType, membershipPeriods } = membership
  const now = moment()

  const payload = {
    ...packageOption,
    templateId: packageOption.id,
    package: package_,
    id: [ packageOption.id, membership.id ].join('-'),
    membership,
    optionGroup: reward.type === 'MembershipType' ? membership.id : false,
    additionalPeriods: []
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

  let endDate = getLatestEndDate(membershipPeriods)

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

  payload.additionalPeriods.push({
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

  await Promise.map(package_.user.memberships, membership => {
    return Promise.map(packageOptions, async packageOption => {
      if (hasDormantMembership({ package_, membership })) {
        debug('user has one or more dormant memberships')
        return false
      }

      results.push(await evaluate({ package_, packageOption, membership }))
    })
  })

  return results
    .filter(Boolean)
    // Sort by sequenceNumber in an ascending manner
    .sort(
      (a, b) =>
        a.membership.sequenceNumber < b.membership.sequenceNumber ? 1 : 0
    )
    // Sort by membership "endDate", ascending
    .sort((a, b) => {
      const aDate = getLatestEndDate(a.membership.membershipPeriods)
      const bDate = getLatestEndDate(b.membership.membershipPeriods)

      return aDate < bDate ? 1 : 0
    })
    // Sort by userID, own ones up top.
    .sort((a, b) => a.membership.userId !== package_.user.id ? 1 : 0)

  // return results.filter(Boolean)
}

/*
  packages[] {
    user: {
      memberhips[] {
        membershipType
        membershipPeriods[]
        pledge {
          package
        }
      }
    }
    packageOptions[] {
      reward
      membershipType
    }
  }
*/
const resolvePackages = async ({ packages, pledger, pgdb }) => {
  debug('resolvePackages', packages.length)

  if (packages.length === 0) {
    debug('no packages to resolve')
    throw new Error('no packages to resolve')
  }

  if (!pledger || !pledger.id) {
    debug('empty pledger object or missing pledger.id')
    throw new Error('empty pledger object or missing pledger.id')
  }

  const pledges = await pgdb.public.pledges.find({
    userId: pledger.id,
    status: 'SUCCESSFUL'
  })

  const memberships =
    await pgdb.public.memberships.find({
      or: [
        { userId: pledger.id },
        pledges.length > 0 && { pledgeId: pledges.map(pledge => pledge.id) }
      ].filter(Boolean)
    })

  const users =
    memberships.length > 0
      ? await pgdb.public.users.find({
        id: memberships.map(membership => membership.userId)
      })
      : []

  const membershipTypes =
    memberships.length > 0
      ? await pgdb.public.membershipTypes.find({
        id: memberships.map(membership => membership.membershipTypeId)
      })
      : []

  const membershipPledges =
    await pgdb.public.pledges.find({
      id: memberships.map(membership => membership.pledgeId)
    })

  const membershipPledgePackages =
    await pgdb.public.packages.find({
      id: membershipPledges.map(pledge => pledge.packageId)
    })

  membershipPledges.forEach((pledge, index, pledges) => {
    pledges[index].package = membershipPledgePackages.find(package_ => package_.id === pledge.packageId)
  })

  memberships.forEach((membership, index, memberships) => {
    const user = users.find(user => user.id === membership.userId)
    memberships[index].claimerName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    memberships[index].membershipType =
      membershipTypes.find(membershipType => membershipType.id === membership.membershipTypeId)
    memberships[index].pledge =
      membershipPledges.find(membershipPledge => membershipPledge.id === membership.pledgeId)
  })

  const membershipPeriods =
    memberships.length > 0
      ? await pgdb.public.membershipPeriods.find({
        membershipId: memberships.map(membership => membership.id)
      })
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].membershipPeriods =
      membershipPeriods.filter(membershipPeriod => membershipPeriod.membershipId === membership.id)
  })

  Object.assign(pledger, { memberships })

  const allPackageOptions =
    await pgdb.public.packageOptions.find({
      packageId: packages.map(package_ => package_.id)
    })

  const allRewards =
    await pgdb.public.rewards.find({
      id: allPackageOptions.map(option => option.rewardId)
    })

  const allMembershipTypes =
    await pgdb.public.membershipTypes.find({
      rewardId: allRewards.map(reward => reward.id)
    })

  return Promise
    .map(packages, async package_ => {
      const packageOptions = allPackageOptions
        .filter(packageOption => packageOption.packageId === package_.id)
        .map(packageOption => {
          const reward =
            allRewards.find(reward => packageOption.rewardId === reward.id)
          const membershipType =
            allMembershipTypes.find(
              membershipType => packageOption.rewardId === membershipType.rewardId
            )
          return { ...packageOption, reward, membershipType }
        })

      Object.assign(package_, { packageOptions, user: pledger })

      return package_
    })
    .filter(Boolean)
}

module.exports = {
  evaluate,
  resolvePackages,
  getCustomOptions
}
