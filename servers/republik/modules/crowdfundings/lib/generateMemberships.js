const moment = require('moment')
const { getPledgeOptionsTree } = require('./Pledge')
const debug = require('debug')('crowdfundings:memberships')
const { enforceSubscriptions } = require('./Mail')

module.exports = async (pledgeId, pgdb, t, req, logger = console) => {
  const pledge = await pgdb.public.pledges.findOne({id: pledgeId})
  const user = await pgdb.public.users.findOne({id: pledge.userId})

  // check if pledge really has no memberships yet
  if (await pgdb.public.memberships.count({pledgeId: pledge.id})) {
    logger.error('tried to generate memberships for a pledge which already has memberships', { pledge })
    throw new Error(t('api/unexpected'))
  }

  // get ingredients
  const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})

  let hasRewards = false
  const pledgeOptions = await getPledgeOptionsTree(
    await pgdb.public.pledgeOptions.find({pledgeId: pledge.id}),
    pgdb
  )
  for (let plo of pledgeOptions) {
    if (plo.packageOption.reward) {
      hasRewards = true
    }
  }
  if (!hasRewards) { // it's a donation-only pledge
    return
  }

  // if the pledge has a negative donation:
  // 1) it's a one membership pledge
  // 2) this membership was bought for a reduced price
  // 3) this membership is not voucherable
  // voucherCodes get generated inside the db, but not for reducedPrice
  const reducedPrice = pledge.donation < 0

  const userHasActiveMembership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    active: true
  })

  const memberships = []
  let membershipPeriod
  const now = new Date()
  pledgeOptions.forEach((plo) => {
    if (plo.packageOption.reward.type === 'MembershipType') {
      const membershipType = plo.packageOption.reward.membershipType
      for (let c = 0; c < plo.amount; c++) {
        const membership = {
          userId: user.id,
          pledgeId: pledge.id,
          membershipTypeId: membershipType.id,
          reducedPrice,
          voucherable: !reducedPrice,
          active: false,
          renew: false,
          createdAt: now,
          updatedAt: now
        }

        if (c === 0 && !membershipPeriod && !userHasActiveMembership && pkg.isAutoActivateUserMembership) {
          membershipPeriod = {
            beginDate: now,
            endDate: moment(now).add(membershipType.intervalCount, membershipType.interval),
            membership
          }
        } else {
          memberships.push(membership)
        }
      }
    }
  })
  debug('generateMemberships membershipPeriod %O', membershipPeriod)
  debug('generateMemberships memberships %O', memberships)

  await pgdb.public.memberships.insert(memberships)

  if (membershipPeriod) {
    const membership = await pgdb.public.memberships.insertAndGet({
      ...membershipPeriod.membership,
      active: true,
      renew: true,
      voucherable: false
    })
    await pgdb.public.membershipPeriods.insert({
      membershipId: membership.id,
      beginDate: membershipPeriod.beginDate,
      endDate: membershipPeriod.endDate,
      createdAt: now,
      updatedAt: now
    })

    try {
      await enforceSubscriptions({
        pgdb,
        userId: user.id,
        isNew: !user.verified,
        subscribeToEditorialNewsletters: true
      })
    } catch (e) {
      console.error('enforceSubscriptions failed in generateMemberships', e)
    }
  }
}
