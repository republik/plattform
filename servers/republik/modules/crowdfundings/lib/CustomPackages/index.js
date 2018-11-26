const debug = require('debug')('crowdfundings:lib:CustomPackages')
const moment = require('moment')
const uuid = require('uuid/v4')
const Promise = require('bluebird')

const { getPeriodEndingLast, getLastEndDate } = require('../utils')
const rules = require('./rules')

// Put that one into database.
const EXTENDABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO']
const EXTENDABLE_PACKAGE_NAMES = ['ABO', 'BENEFACTOR']

// Which options require you to own a membership?
const OPTIONS_REQUIRE_CLAIMER = ['BENEFACTOR_ABO']

const findEligableMemberships = ({ memberships, user }) =>
  memberships.filter(m => {
    const isCurrentClaimer = m.userId === user.id

    const isExtendable =
      EXTENDABLE_MEMBERSHIP_TYPES.includes(m.membershipType.name) &&
      EXTENDABLE_PACKAGE_NAMES.includes(m.pledge.package.name)

    // A membership that was not bought by user itself.
    const isGiftedMembership = m.pledge.userId !== m.userId

    // Self-claimed ABO_GIVE
    const isSelfClaimed =
      m.pledge.userId === m.userId &&
      m.pledge.package.name === 'ABO_GIVE' &&
      m.active

    debug({
      id: m.id,
      membershipTypeName: m.membershipType.name,
      packageName: m.pledge.package.name,
      membershipUserId: m.userId,
      pledgeUserId: m.pledge.userId,
      isCurrentClaimer,
      isExtendable,
      isGiftedMembership,
      isSelfClaimed
    })

    return isCurrentClaimer &&
      (isExtendable || isGiftedMembership || isSelfClaimed)
  })

// Checks if user has at least one active and one inactive membership,
// considering latter as "dormant"
const hasDormantMembership = ({ package_, membership }) => {
  const { user } = package_
  const { memberships } = user

  const inactiveMemberships =
    findEligableMemberships({ memberships, user })
      .filter(m => m.active === false)

  inactiveMemberships.forEach(m => {
    debug('hasDormantMembership.eligableMembership', {
      id: m.id,
      membershipType: m.membershipType.name,
      package: m.pledge.package.name
    })
  })

  const hasInactiveMembership = !!inactiveMemberships.length > 0

  return membership.active === true &&
    membership.userId === user.id &&
    hasInactiveMembership
}

const evaluate = async ({
  package_,
  packageOption,
  membership,
  lenient = false
}) => {
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
  if (!EXTENDABLE_MEMBERSHIP_TYPES.includes(membershipType.name)) {
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

  const lastPeriod = getPeriodEndingLast(membershipPeriods)

  // Has no membershipPeriod with beginDate in future
  // Only memberships with current or past membershipPeriods can be extended.
  if (!lenient && lastPeriod.beginDate > now) {
    debug('membership has a membershipPeriod in future')
    return false
  }

  if (!lenient && lastPeriod.beginDate > now.clone().subtract(24, 'hours')) {
    debug('membership period began not 24 hours ago', lastPeriod.beginDate)
    return false
  }

  let lastEndDate = lastPeriod.endDate

  // If endDate is in past, pushed to now.
  // This indicates that we're dealing with an expired membership.
  if (lastEndDate < now) {
    lastEndDate = now
  }

  // Add a regular period this packageOption would cause.
  // It is a mere suggestion. Dates may differ upon payment.

  const beginEnd = {
    beginDate: lastEndDate,
    endDate: moment(lastEndDate)
      .add(membershipType.intervalCount, membershipType.interval)
  }

  payload.additionalPeriods.push({
    id: uuid(),
    membershipId: membership.id,
    kind: 'REGULAR',
    createdAt: now,
    updatedAt: now,
    ...beginEnd
  })

  // Apply package rules
  await Promise.each(package_.rules, rule => {
    if (rules[rule]) {
      return rules[rule]({ package_, packageOption, membership, payload, now })
    }
  })

  if (reward.type === 'MembershipType') {
    if (membership.userId === package_.user.id) {
      // If options is to extend membership, set defaultAmount to 1 if reward of
      // current packageOption evaluated is same as in evaluated membership.
      payload.defaultAmount =
        packageOption.rewardId === membershipType.rewardId ? 1 : 0
    } else {
      // If user does not own membership, set userPrice to false
      payload.userPrice = false
    }
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
    // Sort by price
    .sort((a, b) => a.price > b.price ? 1 : 0)
    // Sort by defaultAmount
    .sort((a, b) => a.defaultAmount < b.defaultAmount ? 1 : 0)
    // Sort by sequenceNumber in an ascending manner
    .sort(
      (a, b) =>
        a.membership.sequenceNumber < b.membership.sequenceNumber ? 1 : 0
    )
    // Sort by membership "endDate", ascending
    .sort((a, b) => {
      const aDate = getLastEndDate(a.membership.membershipPeriods)
      const bDate = getLastEndDate(b.membership.membershipPeriods)

      return aDate < bDate ? 1 : 0
    })
    // Sort by userID, own ones up top.
    .sort((a, b) => a.membership.userId !== package_.user.id ? 1 : 0)
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
const resolvePackages = async ({ packages, pledger = {}, pgdb }) => {
  debug('resolvePackages', packages.length)

  if (packages.length === 0) {
    debug('no packages to resolve')
    throw new Error('no packages to resolve')
  }

  if (!pledger.id) {
    debug('empty pledger object or missing pledger.id')
  }

  const pledges =
    pledger.id
      ? await pgdb.public.pledges.find({
        userId: pledger.id,
        status: 'SUCCESSFUL'
      })
      : []

  let memberships =
    pledger.id
      ? await pgdb.public.memberships.find({
        or: [
          { userId: pledger.id },
          pledges.length > 0 && { pledgeId: pledges.map(pledge => pledge.id) }
        ].filter(Boolean)
      })
      : []

  memberships = await resolveMemberships({ memberships, pgdb })

  const users =
    memberships.length > 0
      ? await pgdb.public.users.find({
        id: memberships.map(membership => membership.userId)
      })
      : []

  const membershipPeriods =
    memberships.length > 0
      ? await pgdb.public.membershipPeriods.find({
        membershipId: memberships.map(membership => membership.id)
      })
      : []

  memberships.forEach((membership, index, memberships) => {
    const user = users.find(user => user.id === membership.userId)
    memberships[index].user = user
    memberships[index].claimerName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

    memberships[index].membershipPeriods =
      membershipPeriods.filter(
        membershipPeriod => membershipPeriod.membershipId === membership.id
      )
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

  const allGoodies =
    allRewards.length > 0
      ? await pgdb.public.goodies.find({
        rewardId: allRewards.map(reward => reward.id)
      })
      : []

  const allMembershipTypes =
    allRewards.length > 0
      ? await pgdb.public.membershipTypes.find({
        rewardId: allRewards.map(reward => reward.id)
      })
      : []

  allRewards.forEach((reward, index, allRewards) => {
    const goodie = allGoodies
      .find(g => g.rewardId === reward.id)
    const membershipType = allMembershipTypes
      .find(m => m.rewardId === reward.id)

    allRewards[index] = Object.assign({}, reward, membershipType, goodie)
  })

  return Promise
    .map(packages, async package_ => {
      const packageOptions = allPackageOptions
        .filter(packageOption => packageOption.packageId === package_.id)
        .map(packageOption => {
          const reward = allRewards
            .find(reward => packageOption.rewardId === reward.rewardId)
          const membershipType = allMembershipTypes.find(
            membershipType => packageOption.rewardId === membershipType.rewardId
          )

          return { ...packageOption, reward, membershipType }
        })

      Object.assign(package_, { packageOptions, user: pledger })

      return package_
    })
    .filter(Boolean)
}

const resolveMemberships = async ({ memberships, pgdb }) => {
  debug('resolveMemberships')

  const membershipTypes =
    memberships.length > 0
      ? await pgdb.public.membershipTypes.find({
        id: memberships.map(membership => membership.membershipTypeId)
      })
      : []

  const membershipPledges =
    memberships.length > 0
      ? await pgdb.public.pledges.find({
        id: memberships.map(membership => membership.pledgeId)
      })
      : []

  const membershipPledgePackages =
    membershipPledges.length > 0
      ? await pgdb.public.packages.find({
        id: membershipPledges.map(pledge => pledge.packageId)
      })
      : []

  membershipPledges.forEach((pledge, index, pledges) => {
    pledges[index].package = membershipPledgePackages.find(package_ => package_.id === pledge.packageId)
  })

  memberships.forEach((membership, index, memberships) => {
    memberships[index].membershipType =
      membershipTypes.find(
        membershipType => membershipType.id === membership.membershipTypeId
      )
    memberships[index].pledge =
      membershipPledges.find(
        membershipPledge => membershipPledge.id === membership.pledgeId
      )
  })

  return memberships
}

module.exports = {
  findEligableMemberships,
  evaluate,
  resolvePackages,
  resolveMemberships,
  getCustomOptions
}
