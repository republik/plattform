const debug = require('debug')('crowdfundings:lib:CustomPackages')
const moment = require('moment')
const { v4: uuid } = require('uuid')
const Promise = require('bluebird')
const { ascending, descending } = require('d3-array')

const {
  applyPgInterval: { add: addInterval },
} = require('@orbiting/backend-modules-utils')

const { getPeriodEndingLast, getLastEndDate } = require('../utils')
const rules = require('./rules')

// membershipTypes and packages which are prolongable
const EXTENDABLE_MEMBERSHIP_TYPES = ['ABO', 'BENEFACTOR_ABO', 'ABO_GIVE_MONTHS']
const EXTENDABLE_PACKAGE_NAMES = ['ABO', 'BENEFACTOR']

// membershipTypes which are can be dormant but are not
// prolongabl by themselves
const DORMANT_ONLY_MEMBERSHIP_TYPES = ['YEARLY_ABO']

// Which options require you to own a membership?
const OPTIONS_REQUIRE_CLAIMER = ['BENEFACTOR_ABO']

// for a user to prolong
const findEligableMemberships = ({
  memberships,
  user,
  ignoreClaimedMemberships = false,
}) =>
  memberships.filter((m) => {
    const isCurrentClaimer = m.userId === user.id

    const isExtendable =
      EXTENDABLE_MEMBERSHIP_TYPES.includes(m.membershipType.name) &&
      EXTENDABLE_PACKAGE_NAMES.includes(m.pledge.package.name)

    const isDormantOnly = DORMANT_ONLY_MEMBERSHIP_TYPES.includes(
      m.membershipType.name,
    )

    // A membership that was not bought by user itself.
    const isClaimedMembership = m.pledge.userId !== m.userId

    // Self-claimed ABO_GIVE, ABO_GIVE_MONTHS
    const isSelfClaimed =
      m.pledge.userId === m.userId &&
      ['ABO_GIVE', 'ABO_GIVE_MONTHS'].includes(m.pledge.package.name) &&
      !m.voucherCode

    debug({
      id: m.id,
      membershipTypeName: m.membershipType.name,
      packageName: m.pledge.package.name,
      membershipUserId: m.userId,
      pledgeUserId: m.pledge.userId,
      isCurrentClaimer,
      isExtendable,
      isClaimedMembership,
      isSelfClaimed,
    })

    return (
      isCurrentClaimer &&
      (isExtendable || isDormantOnly || isClaimedMembership || isSelfClaimed) &&
      (!ignoreClaimedMemberships || !isClaimedMembership)
    )
  })

const findDormantMemberships = ({ memberships, user }) =>
  findEligableMemberships({ memberships, user }).filter(
    (m) =>
      m.userId === user.id &&
      m.active === false &&
      m.periods &&
      m.periods.length === 0,
  )

// Checks if user has at least one active and one inactive membership,
// considering latter as "dormant"
const hasDormantMembership = ({ user, memberships }) => {
  const activeMembership = memberships.filter(
    (m) => m.userId === user.id && m.active === true,
  )

  const dormantMemberships = findDormantMemberships({ memberships, user })

  dormantMemberships.forEach((m) => {
    debug('hasDormantMembership.dormantMemberships.membership', {
      id: m.id,
      membershipType: m.membershipType.name,
      package: m.pledge.package.name,
    })
  })

  return activeMembership && !!dormantMemberships.length > 0
}

/**
 * Evalutes whether a (resolved) package and some packageOption may be applicable
 * to a membership.
 *
 * It returns a filtered and sorted array w/ packageOptions.
 */
const evaluate = async ({
  package_,
  packageOption,
  membership,
  lenient = false,
}) => {
  debug('evaluate')

  const { membershipType: packageOptionMembershipType } = packageOption

  if (!membership.id) {
    return {
      ...packageOption,
      templateId: packageOption.id,
      package: package_,
      membership: null,
      optionGroup: packageOption.id,
      additionalPeriods: [],
    }
  }

  const { membershipType, periods, latestPeriod } = membership

  const payload = {
    ...packageOption,
    ...(packageOption.reward?.type === 'MembershipType' && {
      id: [packageOption.id, membership.id].join('-'),
    }),
    templateId: packageOption.id,
    package: package_,
    membership,
    optionGroup: membership.id,
    additionalPeriods: [],
  }

  const now = moment()

  if (packageOption.reward?.type === 'MembershipType') {
    // Is user membership next to another active user membership?
    // If there is an active membership, user should only be able to extend
    // the active membership
    if (
      !membership.active &&
      membership.user.id === package_.user.id &&
      package_.user.memberships.find((m) => m.active)
    ) {
      debug('membership next to an active membership')
      return false
    }

    // Gifted memberships can not be extended if their no longer active
    if (!membership.active && membership.user.id !== package_.user.id) {
      debug('only owner can extend inactive membership')
      return false
    }

    // Can membership.membershipType be extended?
    // Not all membershipTypes can be extended
    if (!EXTENDABLE_MEMBERSHIP_TYPES.includes(membershipType.name)) {
      debug('not extendable membershipType "%s"', membershipType.name)
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
        packageOption.membershipType.name,
      )
      return false
    }

    // Has membership any membershipPeriods?
    // Indicates whether a membership is or was active. Only those can be
    // extended.
    if (periods.length === 0) {
      debug('membership has no membershipPeriods')
      return false
    }

    let lastEndDate = latestPeriod.endDate

    // A membership can be renewed 364 days before it ends at the most
    if (!lenient && moment(lastEndDate).isAfter(now.clone().add(364, 'days'))) {
      debug('membership lasts more than 364 days', lastEndDate)
      return false
    }

    const lastEndDateWithGracePeriod = addInterval(
      lastEndDate,
      membership.graceInterval,
    )

    /**
     * Usually, we want to extend an existing series of periods. We therefor
     * suggest a new period which start where the last one ends.
     *
     * In some cases this is not desired, and requires to set `lastEndDate`
     * to `now` if...
     * a) ... membership is active and `lastEndDate` plus a grace period is over
     * b) ... membership is inactive and `lastEndDate` is over
     *
     */
    if (
      (membership.active && lastEndDateWithGracePeriod < now) ||
      (!membership.active && lastEndDate < now)
    ) {
      lastEndDate = now
    }

    // Add a regular period this packageOption would cause.
    const beginEnd = {
      beginDate: lastEndDate,
      endDate: moment(lastEndDate).add(
        packageOptionMembershipType.defaultPeriods,
        packageOptionMembershipType.interval,
      ),
    }

    payload.additionalPeriods.push({
      id: uuid(),
      membershipId: membership.id,
      kind: 'REGULAR',
      createdAt: now,
      updatedAt: now,
      ...beginEnd,
    })

    const isSameRewardId =
      packageOption.rewardId ===
      (latestPeriod.pledgeOption?.packageOption?.rewardId ||
        membershipType.rewardId)

    const suggestedPrice =
      isSameRewardId && latestPeriod.pledge?.pledgeOptions?.length === 1
        ? latestPeriod.pledge.total
        : packageOption.price

    if (suggestedPrice !== packageOption.price) {
      payload.suggestedPrice = suggestedPrice
    }

    const isOwnMembership = membership.userId === package_.user.id
    // If membership stems from ABO_GIVE_MONTHS package, default ABO option
    if (
      isOwnMembership &&
      membership.pledge.package.name === 'ABO_GIVE_MONTHS'
    ) {
      if (packageOption.membershipType.name === 'ABO') {
        payload.defaultAmount = 1
      }
    } else {
      if (isOwnMembership) {
        // If options is to extend membership, set defaultAmount to 1 if reward
        // of current packageOption evaluated is same as in evaluated
        // membership.
        payload.defaultAmount = isSameRewardId ? 1 : 0
      } else {
        // If user does not own membership, set userPrice to false
        payload.userPrice = false
      }
    }
  }

  // Apply package rules. Rules may pass or not, and may mutate payload.
  const passed = await Promise.map(package_.rules, (rule) => {
    if (rules[rule]) {
      return rules[rule]({ package_, packageOption, membership, payload, now })
    }

    // If a rule is not available, do not pass.
    return false
  })

  // Check if all rules passed
  if (passed.length > 0 && passed.some((r) => !r)) {
    debug('one or more rules did not pass')
    return false
  }

  // Return packageOption if not a MembershipType reward.
  if (packageOption.reward?.type !== 'MembershipType') {
    return {
      ...packageOption,
      templateId: packageOption.id,
    }
  }

  return payload
}

const getCustomOptions = async (package_) => {
  debug('getCustomOptions', package_.name, package_.id)
  debug('user', package_.user.id)

  const { packageOptions } = package_

  const options = []

  const hasMembershipTypePackageOptions = !!packageOptions.filter(
    (option) => option.reward?.type === 'MembershipType',
  ).length

  await Promise.map(
    package_.custom ? package_.user.memberships : [{}],
    (membership) =>
      Promise.map(packageOptions, async (packageOption) => {
        const { user } = package_
        if (
          hasMembershipTypePackageOptions &&
          membership.active &&
          membership.userId === user.id &&
          hasDormantMembership({
            user,
            memberships: user.memberships,
          })
        ) {
          debug('user has one or more dormant memberships')
          return false
        }

        const evaluatedOption = await evaluate({
          package_,
          packageOption,
          membership,
        })

        // Add option if there it is not in options already, determine
        // by option.id.
        if (
          evaluatedOption &&
          !options.find((option) => option.id === evaluatedOption.id)
        ) {
          options.push(evaluatedOption)
        }
      }),
  )

  if (
    hasMembershipTypePackageOptions &&
    !options
      .filter(Boolean)
      .find((option) => option.reward?.type === 'MembershipType')
  ) {
    return
  }

  const filteredAndSortedOptions = options
    .filter(
      (option) =>
        // Options with a non-membership reward shall be kept either
        // way, likes goodies aswell options with a membership reward
        // that would profit not this user like gifted memberships.
        option.reward?.type !== 'MembershipType' ||
        option.membership?.user.id !== package_.user.id ||
        // User should only see options for the most recently ended membership.
        // So, for membership-rewarding options, we check first if there
        // is a membership with more recent periods. If not, we keep option.
        !options.find(
          (o) =>
            o.membership?.user.id === package_.user.id &&
            o.membership?.id !== option.membership?.id &&
            o.membership?.latestPeriod.endDate >
              option.membership?.latestPeriod.endDate,
        ),
    )
    .filter(Boolean)
    // Sort by price
    .sort((a, b) => descending(a.price, b.price))
    // Sort by defaultAmount
    .sort((a, b) => descending(a.defaultAmount, b.defaultAmount))
    // Sort by sequenceNumber in an ascending manner
    .sort((a, b) =>
      ascending(
        a.membership && a.membership.sequenceNumber,
        b.membership && b.membership.sequenceNumber,
      ),
    )
    // Sort by membership "endDate", ascending
    .sort((a, b) =>
      ascending(
        a.membership && getLastEndDate(a.membership.periods),
        b.membership && getLastEndDate(b.membership.periods),
      ),
    )
    // Sort by userID, own ones up top.
    .sort((a, b) =>
      descending(
        a.membership && a.membership.userId === package_.user.id,
        b.membership && b.membership.userId === package_.user.id,
      ),
    )
    // … aaaand findally sort by sortOrder, at last
    .sort((a, b) => ascending(a.order, b.order))

  if (!filteredAndSortedOptions.length) {
    return
  }

  const suggestedTotal = filteredAndSortedOptions
    .filter((option) => option.defaultAmount > 0)
    .map((option) => option.suggestedPrice)
    .filter(Boolean)
    .find((price) => !!price)

  return {
    ...package_,
    options: filteredAndSortedOptions,
    suggestedTotal,
  }
}

/*
  packages[] {
    user: {
      memberhips[] @see resolveMemberships
    }
    packageOptions[] {
      reward
        reward
        membershipType
        goodie
      membershipType
    }
  }
*/
const resolvePackages = async ({
  packages,
  pledger = {},
  strict = false,
  pgdb,
}) => {
  debug('resolvePackages', { packages: packages.length, strict })

  if (packages.length === 0) {
    debug('no packages to resolve')
    throw new Error('no packages to resolve')
  }

  if (!pledger.id) {
    debug('empty pledger object or missing pledger.id')
  }

  const pledges = pledger.id
    ? await pgdb.public.pledges.find({
        userId: pledger.id,
        status: 'SUCCESSFUL',
      })
    : []

  const memberships_ = pledger.id
    ? await pgdb.public.memberships.find({
        or: [
          { userId: pledger.id },
          pledges.length > 0 && {
            pledgeId: pledges.map((pledge) => pledge.id),
          },
        ].filter(Boolean),
      })
    : []

  const memberships = await resolveMemberships({
    memberships: memberships_,
    pgdb,
  })

  const now = moment()

  const allPackageOptions = await pgdb.public.packageOptions.find({
    packageId: packages.map((package_) => package_.id),
    and: [
      { or: [{ 'disabledAt >': now }, { disabledAt: null }] },
      strict && { or: [{ 'hiddenAt >': now }, { hiddenAt: null }] },
    ].filter(Boolean),
  })

  const allRewards =
    allPackageOptions.length > 0
      ? await pgdb.public.rewards.find({
          id: allPackageOptions.map((option) => option.rewardId),
        })
      : []

  const allGoodies =
    allRewards.length > 0
      ? await pgdb.public.goodies.find({
          rewardId: allRewards.map((reward) => reward.id),
        })
      : []

  const allMembershipTypes =
    allRewards.length > 0
      ? await pgdb.public.membershipTypes.find({
          rewardId: allRewards.map((reward) => reward.id),
        })
      : []

  allRewards.forEach((reward, index, allRewards) => {
    const goodie = allGoodies.find((g) => g.rewardId === reward.id)
    const membershipType = allMembershipTypes.find(
      (m) => m.rewardId === reward.id,
    )

    allRewards[index] = Object.assign({}, reward, membershipType, goodie)
  })

  const resolvedPackages = await Promise.map(packages, async (package_) => {
    const packageOptions = allPackageOptions
      .filter((packageOption) => packageOption.packageId === package_.id)
      .map((packageOption) => {
        const reward = allRewards.find(
          (reward) => packageOption.rewardId === reward.rewardId,
        )
        const membershipType = allMembershipTypes.find(
          (membershipType) =>
            packageOption.rewardId === membershipType.rewardId,
        )

        return { ...packageOption, reward, membershipType }
      })

    return { ...package_, packageOptions, user: { ...pledger, memberships } }
  })

  return resolvedPackages.sort((a, b) => ascending(a.order, b.order))
}

/*
  memberships[]: {
    // initial membership data (type, pledge, causing option)
    membershipType
    pledge: {
      pledgeOptions[]: {
        packageOption {
          membershipType
        }
      }
      package
    }
    pledgeOption: {
      packageOption {
        membershipType
      }
    }

    periods[]: {
      // subsequent membership data (pledge, causing option)
      pledge: {
        pledgeOptions[]: {
          packageOption {
            membershipType
          }
        }
        package
      }

      pledgeOption: {
        packageOption {
          membershipType
        }
      }
    }

    latestPeriod: {
      pledge: {
        pledgeOptions[]: {
          packageOption {
            membershipType
          }
        }
        package
      }

      pledgeOption: {
        packageOption {
          membershipType
        }
      }
    }

    user
    claimerName
  }
*/
const resolveMemberships = async ({ memberships, pgdb }) => {
  debug('resolveMemberships')

  const membershipPeriods = memberships.length
    ? await pgdb.public.membershipPeriods.find({
        membershipId: memberships.map((membership) => membership.id),
      })
    : []

  const pledgeIds = [
    ...membershipPeriods.map((period) => period.pledgeId).filter(Boolean),
    ...memberships.map((membership) => membership.pledgeId).filter(Boolean),
  ]

  const pledges = pledgeIds.length
    ? await pgdb.public.pledges.find({
        id: pledgeIds,
      })
    : []

  const pledgePackages = pledges.length
    ? await pgdb.public.packages.find({
        id: pledges.map((pledge) => pledge.packageId),
      })
    : []

  const pledgeOptions = pledgeIds.length
    ? await pgdb.public.pledgeOptions.find({
        pledgeId: pledgeIds,
        'amount >': 0,
      })
    : []

  const membershipPeriodPackageOptions =
    pledgeOptions.length > 0
      ? await pgdb.public.packageOptions.find({
          id: pledgeOptions.map((option) => option.templateId),
        })
      : []

  const membershipTypes = await pgdb.public.membershipTypes.findAll()

  membershipPeriodPackageOptions.forEach(
    (packageOption, index, packageOptions) => {
      packageOptions[index].membershipType = membershipTypes.find(
        (membershipType) => membershipType.rewardId === packageOption.rewardId,
      )
    },
  )

  pledgeOptions.forEach((pledgeOption, index, pledgeOptions) => {
    pledgeOptions[index].packageOption = membershipPeriodPackageOptions.find(
      (packageOption) => packageOption.id === pledgeOption.templateId,
    )
  })

  pledges.forEach((pledge, index, pledges) => {
    pledges[index].pledgeOptions = pledgeOptions.filter(
      (pledgeOption) => pledgeOption.pledgeId === pledge.id,
    )
    pledges[index].package = pledgePackages.find(
      (package_) => package_.id === pledge.packageId,
    )
  })

  membershipPeriods.forEach((period, index, periods) => {
    periods[index].pledge = pledges.find(
      (pledge) => pledge.id === period.pledgeId,
    )
    periods[index].pledgeOption = pledgeOptions.find(
      (option) =>
        option.pledgeId === period.pledgeId &&
        option.membershipId === period.membershipId,
    )
  })

  const membershipTypeRewardIds = membershipTypes.map((type) => type.rewardId)

  const users =
    memberships.length > 0
      ? await pgdb.public.users.find({
          id: memberships.map((membership) => membership.userId),
        })
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].membershipType = membershipTypes.find(
      (membershipType) => membershipType.id === membership.membershipTypeId,
    )
    memberships[index].pledge = pledges.find(
      (pledge) => pledge.id === membership.pledgeId,
    )
    memberships[index].pledgeOption = pledgeOptions.find(
      (option) =>
        option.pledgeId === membership.pledgeId &&
        membershipTypeRewardIds.includes(option.packageOption.rewardId),
    )
    memberships[index].periods = membershipPeriods.filter(
      (period) => period.membershipId === membership.id,
    )
    memberships[index].latestPeriod = getPeriodEndingLast(
      memberships[index].periods,
    )

    const user = users.find((user) => user.id === membership.userId)
    memberships[index].user = user
    memberships[index].claimerName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()
  })

  return memberships
}

module.exports = {
  findEligableMemberships,
  findDormantMemberships,
  hasDormantMembership,
  evaluate,
  resolvePackages,
  resolveMemberships,
  getCustomOptions,
}
