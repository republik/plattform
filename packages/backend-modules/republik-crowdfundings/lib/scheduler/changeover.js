const debug = require('debug')('crowdfundings:lib:scheduler:changeover')
const moment = require('moment')
const Promise = require('bluebird')

const { resolveMemberships } = require('../CustomPackages')
const createCache = require('../cache')
const electDormantMembership = require('../electDormantMembership')

const { PARKING_USER_ID } = process.env

const EXCLUDE_MEMBERSHIP_TYPES = ['MONTHLY_ABO']

const activeMembershipsQuery = `
-- Active memberships and their MAX(membershipPeriods.endDate)
SELECT m.*, MAX(mp."endDate") AS "endDate"
FROM memberships m
INNER JOIN "membershipPeriods" mp
  ON m.id = mp."membershipId"
INNER JOIN "membershipTypes" mt
  ON m."membershipTypeId" = mt.id
  AND mt.name NOT IN (${EXCLUDE_MEMBERSHIP_TYPES.map((t) => `'${t}'`).join(
    ', ',
  )})
WHERE
  m.active = true
GROUP BY m.id
`

const changeover = async (
  { dryRun },
  { pgdb, mail: { enforceSubscriptions }, redis },
) => {
  const endDate = moment()

  const users = await pgdb.public.query(
    `
    WITH memberships AS (${activeMembershipsQuery})
    SELECT DISTINCT("userId") AS id FROM memberships
    WHERE
      -- Potential ending memberships to change over to dormant membership
      ("endDate" < :endDate OR "endDate" + "graceInterval" < :endDate)
      AND "userId" != :PARKING_USER_ID
  `,
    { endDate, PARKING_USER_ID },
  )

  debug({
    now: endDate.toDate(),
    users: users.length,
  })

  const stats = { changeover: 0 }

  await Promise.each(users, async (user) => {
    const activeMemberships = await pgdb.public.memberships.find({
      userId: user.id,
      active: true,
    })

    if (activeMemberships.length > 1) {
      console.error('changeover failed: multiple active memberships found', {
        user: user.id,
      })
      return
    }

    const activeMembership = (
      await resolveMemberships({
        memberships: activeMemberships,
        pgdb,
      })
    )[0]

    const electedDormantMembership = await electDormantMembership(
      { id: user.id },
      pgdb,
    )
    if (!electedDormantMembership) {
      return
    }

    stats.changeover++

    if (dryRun) {
      return
    }

    const transaction = await pgdb.transactionBegin()

    try {
      const now = moment()

      const sunsetMembership =
        await transaction.public.memberships.updateAndGetOne(
          { id: activeMembership.id },
          {
            succeedingMembershipId: electedDormantMembership.id,
            active: false,
            renew: false,
            updatedAt: now,
          },
        )

      if (!sunsetMembership) {
        console.error('changeover failed: unable to sunset membership', {
          membership: { id: activeMembership.id },
        })
        throw new Error('Unable to unset membership')
      }

      const membershipCancellations =
        await transaction.public.membershipCancellations.find({
          membershipId: sunsetMembership.id,
          'category !=': 'SYSTEM',
          revokedAt: null,
        })

      const activatedMembership =
        await transaction.public.memberships.updateAndGetOne(
          { id: electedDormantMembership.id },
          {
            active: true,
            renew: !membershipCancellations.length,
            voucherCode: null,
            voucherable: false,
            updatedAt: now,
          },
        )

      if (!activatedMembership) {
        console.error(
          'changeover failed: unable to activate elected membership',
          { membership: { id: activatedMembership.id } },
        )
        throw new Error('Unable to activate elected membership')
      }

      const { initialPeriods, initialInterval } = electedDormantMembership

      const beginDate = now
      const endDate = beginDate.clone().add(initialPeriods, initialInterval)

      const insertedPeriods = await transaction.public.membershipPeriods.insert(
        {
          membershipId: electedDormantMembership.id,
          beginDate,
          endDate,
          kind: 'CHANGEOVER',
          createdAt: now,
          updatedAt: now,
        },
      )

      if (!insertedPeriods) {
        console.error(
          'changeover failed: unable to insert periods for elected membership',
          { membership: { id: activatedMembership.id } },
        )
        throw new Error('Unable to insert periods for elected membership')
      }

      createCache({ prefix: `User:${user.id}` }, { redis }).invalidate()

      await transaction.transactionCommit()
    } catch (e) {
      await transaction.transactionRollback()
      console.log('transaction rollback, changeover failed', {
        user: user.id,
        error: e,
      })
      throw e
    }

    await enforceSubscriptions({ userId: user.id, pgdb })
  })

  debug({ stats, dryRun })
}

module.exports = {
  changeover,
  activeMembershipsQuery,
}
