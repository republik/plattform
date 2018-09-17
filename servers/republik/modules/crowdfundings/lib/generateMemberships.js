const moment = require('moment')
const { getPledgeOptionsTree } = require('./Pledge')
const cancelMembership = require('../graphql/resolvers/_mutations/cancelMembership')
const debug = require('debug')('crowdfundings:memberships')
const { enforceSubscriptions } = require('./Mail')
const Promise = require('bluebird')

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

  const activeMemberships = await pgdb.public.query(`
    SELECT
      "memberships".*,
      "membershipTypes"."name"

    FROM "memberships"

    INNER JOIN "membershipTypes"
      ON "memberships"."membershipTypeId" = "membershipTypes"."id"

    WHERE
      "memberships"."userId" = '${user.id}'
      AND "memberships"."active" = true
  `)

  const userHasActiveMembership = activeMemberships.length > 0

  const memberships = []
  let cancelableMemberships = []
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

        if (
          c === 0 &&
          !membershipPeriod &&
          !userHasActiveMembership &&
          pkg.isAutoActivateUserMembership
        ) {
          membershipPeriod = {
            beginDate: now,
            endDate: moment(now).add(membershipType.intervalCount, membershipType.interval),
            membership
          }
        } else {
          // Cancel active memberships because bought package (option) contains
          // a better abo.
          if (['ABO', 'BENEFACTOR_ABO'].includes(membershipType.name)) {
            cancelableMemberships =
              activeMemberships
                .filter(m => (m.name === 'MONTHLY_ABO' && m.renew === true))
          }

          debug({ activeMemberships, cancelableMemberships })

          memberships.push(membership)
        }
      }
    }
  })
  debug('generateMemberships membershipPeriod %O', membershipPeriod)
  debug('generateMemberships memberships %O', memberships)

  await pgdb.public.memberships.insert(memberships)

  if (cancelableMemberships.length > 0 && req) {
    debug(
      'cancel memberships, is an upgrade',
      { ids: cancelableMemberships.map(m => m.id) }
    )

    await Promise.map(cancelableMemberships, m => cancelMembership(
      null,
      { id: m.id, reason: 'Auto cancellation due to upgrade' },
      { req, t, pgdb }
    ))
  }

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
