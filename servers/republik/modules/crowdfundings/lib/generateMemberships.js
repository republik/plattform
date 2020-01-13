const moment = require('moment')
const { getPledgeOptionsTree } = require('./Pledge')
const { evaluate, resolvePackages } = require('./CustomPackages')
const createCache = require('./cache')
const cancelMembership = require('../graphql/resolvers/_mutations/cancelMembership')
const debug = require('debug')('crowdfundings:memberships')
const mail = require('./Mail')
const Promise = require('bluebird')
const omit = require('lodash/omit')

const MONTHLY_ABO_UPGRADE_PKGS = ['ABO', 'BENEFACTOR']

module.exports = async (pledgeId, pgdb, t, req, redis) => {
  const pledge = await pgdb.public.pledges.findOne({ id: pledgeId })
  const user = await pgdb.public.users.findOne({ id: pledge.userId })

  // check if pledge really has no memberships yet
  if (await pgdb.public.memberships.count({ pledgeId: pledge.id })) {
    console.error('tried to generate memberships for a pledge which already has memberships', { pledge })
    throw new Error(t('api/unexpected'))
  }

  // get ingredients
  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })

  let hasRewards = false
  const pledgeOptions = await getPledgeOptionsTree(
    await pgdb.public.pledgeOptions.find({ pledgeId: pledge.id }),
    pgdb
  )
  for (const plo of pledgeOptions) {
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
  const now = moment()

  let cancelableMemberships = []
  let membershipPeriod
  let subscribeToEditorialNewsletters = false

  await Promise.map(pledgeOptions, async (plo) => {
    if (plo.packageOption.reward.type === 'MembershipType') {
      // Is amount in pledgeOption > 0?
      if (plo.amount === 0) {
        debug('pledgeOption amount is 0')
        return
      }

      const { membershipType } = plo.packageOption.reward

      if (plo.membershipId) {
        debug('membershipId "%s"', plo.membershipId)

        const resolvedPackage = (await resolvePackages({
          packages: [pkg],
          pledger: user,
          pgdb
        })).shift()

        const membership = resolvedPackage.user.memberships
          .find(m => m.id === plo.membershipId)

        // Refrain from generate periods if membership already has periods which
        // stem from passed pledge.
        if (membership.periods.find(p => p.pledgeId === pledge.id)) {
          debug('periods already generated', {
            membershipId: membership.id,
            pledgeId: pledge.id
          })
          return
        }

        const { additionalPeriods } =
          await evaluate({
            package_: resolvedPackage,
            packageOption: { ...plo.packageOption, membershipType },
            membership,
            lenient: true
          })

        if (!additionalPeriods || additionalPeriods.length === 0) {
          console.error(
            'evaluation returned no additional periods',
            { pledge }
          )
          throw new Error(t('api/unexpected'))
        }

        await pgdb.public.membershipPeriods.insert(
          additionalPeriods
            .map(period => omit(period, ['id', 'createdAt', 'updatedAt']))
            .map(period =>
              Object.assign(period, { pledgeId: plo.pledgeId })
            )
        )

        await pgdb.public.memberships.update(
          { id: plo.membershipId },
          {
            autoPay: plo.autoPay || membership.autoPay,
            active: true,
            renew: true,
            updatedAt: now
          }
        )

        debug('additionalPeriods %o', additionalPeriods)

        if (membership.userId !== pledge.userId) {
          await mail.sendMembershipProlongConfirmation({
            pledger: user, membership, additionalPeriods, t, pgdb
          })
        }
      } else {
        for (let c = 0; c < plo.amount; c++) {
          const membership = {
            userId: user.id,
            pledgeId: pledge.id,
            membershipTypeId: membershipType.id,
            reducedPrice,
            voucherable: !reducedPrice,
            active: false,
            renew: false,
            autoPay: plo.autoPay || false,
            initialInterval: membershipType.interval,
            initialPeriods: plo.periods,
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
              pledgeOptionId: plo.id,
              beginDate: now,
              endDate: now.clone().add(
                membership.initialPeriods,
                membership.initialInterval
              ),
              membership
            }
          } else {
            // Cancel active memberships because bought package (option) contains
            // a better abo.
            if (MONTHLY_ABO_UPGRADE_PKGS.includes(pkg.name)) {
              cancelableMemberships =
                activeMemberships
                  .filter(m => (m.name === 'MONTHLY_ABO' && m.renew === true))
            }

            debug({ activeMemberships, cancelableMemberships })

            memberships.push(membership)
          }
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
      {
        id: m.id,
        details: {
          type: 'SYSTEM',
          reason: 'Auto Cancellation (generateMemberships)',
          suppressConfirmation: true,
          suppressWinback: true
        }
      },
      { req, t, pgdb, redis, mail }
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
      pledgeId: membership.pledgeId,
      beginDate: membershipPeriod.beginDate,
      endDate: membershipPeriod.endDate,
      createdAt: now,
      updatedAt: now
    })

    subscribeToEditorialNewsletters = true
  }

  try {
    await mail.enforceSubscriptions({
      pgdb,
      userId: user.id,
      isNew: !user.verified,
      subscribeToEditorialNewsletters
    })
  } catch (e) {
    console.error('enforceSubscriptions failed in generateMemberships', e)
  }

  const cache = createCache({ prefix: `User:${user.id}` }, { redis })
  cache.invalidate()
}
