const debug = require('debug')('crowdfundings:lib:scheduler:changeover')
const moment = require('moment')
const Promise = require('bluebird')
const { ascending } = require('d3-array')

const {
  resolveMemberships,
  findDormantMemberships
} = require('../CustomPackages')
const createCache = require('../cache')
const { getLastEndDate } = require('../utils')

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
  AND mt.name NOT IN (${EXCLUDE_MEMBERSHIP_TYPES.map(t => `'${t}'`).join(', ')})
WHERE
  m.active = true
GROUP BY m.id
`

const changeover = async (
  { dryRun },
  { pgdb, mail: { enforceSubscriptions }, redis }
) => {
  const endDate = moment()

  const users = await pgdb.public.query(`
    WITH memberships AS (${activeMembershipsQuery})
    SELECT DISTINCT("userId") AS id FROM memberships
    WHERE
      -- Potential ending memberships to change over to dormant membership
      "endDate" < :endDate
      AND "userId" != :PARKING_USER_ID
  `, { endDate, PARKING_USER_ID })

  debug({
    now: endDate.toDate(),
    users: users.length
  })

  const stats = { changeover: 0 }

  await Promise.each(
    users,
    async user => {
      // Find all memberships a user owns
      let userMemberships = await pgdb.public.memberships.find(
        { userId: user.id }
      )

      userMemberships = await resolveMemberships({
        memberships: userMemberships,
        pgdb
      })

      if (userMemberships.filter(m => m.active).length > 1) {
        console.error(
          'changeover failed: multiple active memberships found',
          { user }
        )
        return
      }

      const activeMembership = userMemberships.find(m => m.active)
      if (moment(getLastEndDate(activeMembership.periods)) > endDate) {
        console.error(
          'changeover failed: active memberships ends later',
          { user, endDate }
        )
        return
      }

      const dormantMemberships = findDormantMemberships({
        memberships: userMemberships,
        user: { id: user.id }
      })

      // End here if there is no dormant membership to be found
      if (dormantMemberships.length < 1) {
        return
      }

      // Elect a dormant membership to activate. Rule is to elect dormant
      // membership with lowest sequenceNumber.
      // Sorts sequenceNumber ascending, uses first row. Will overwrite, if a
      // membershipType BENEFACTOR_ABO comes by.
      const electedDormantMembership = dormantMemberships
        .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))
        .reduce((acc, curr) =>
          (!acc && curr) ||
          (acc.membershipType.name !== 'BENEFACTOR_ABO' && curr.membershipType.name === 'BENEFACTOR_ABO' && curr) ||
          acc
        )

      debug({
        activeMembership: activeMembership.id,
        electedDormantMembership: {
          id: electedDormantMembership.id,
          type: electedDormantMembership.membershipType.name
        },
        dryRun
      })

      stats.changeover++

      if (dryRun) {
        return
      }

      const transaction = await pgdb.transactionBegin()

      try {
        const now = moment()

        const sunsetMembership = await transaction.public.memberships.updateAndGetOne(
          { id: activeMembership.id },
          {
            succeedingMembershipId: electedDormantMembership.id,
            active: false,
            renew: false,
            updatedAt: now
          }
        )

        if (!sunsetMembership) {
          console.error(
            'changeover failed: unable to sunset membership',
            { membership: { id: activeMembership.id } }
          )
          throw new Error('Unable to unset membership')
        }

        const activatedMembership = await transaction.public.memberships.updateAndGetOne(
          { id: electedDormantMembership.id },
          {
            active: true,
            renew: activeMembership.renew,
            updatedAt: now
          }
        )

        if (!activatedMembership) {
          console.error(
            'changeover failed: unable to activate elected membership',
            { membership: { id: activatedMembership.id } }
          )
          throw new Error('Unable to activate elected membership')
        }

        const beginDate = now
        const endDate = beginDate.clone().add(
          electedDormantMembership.initialPeriods,
          electedDormantMembership.initialInterval
        )

        const insertedPeriods = await transaction.public.membershipPeriods.insert({
          membershipId: electedDormantMembership.id,
          beginDate,
          endDate,
          kind: 'CHANGEOVER',
          createdAt: now,
          updatedAt: now
        })

        if (!insertedPeriods) {
          console.error(
            'changeover failed: unable to insert periods for elected membership',
            { membership: { id: activatedMembership.id } }
          )
          throw new Error('Unable to insert periods for elected membership')
        }

        createCache({ prefix: `User:${user.id}` }, { redis }).invalidate()

        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()
        console.log(
          'transaction rollback, changeover failed',
          { user: user.id, error: e }
        )
        throw e
      }

      await enforceSubscriptions({ userId: user.id, pgdb })
    }
  )

  debug({ stats, dryRun })
}

module.exports = {
  changeover,
  activeMembershipsQuery
}
