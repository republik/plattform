const debug = require('debug')('crowdfundings:lib:scheduler:changeover')
const moment = require('moment')
const Promise = require('bluebird')

const {
  resolveMemberships,
  findDormantMemberships
} = require('../CustomPackages')

const createCache = require('../cache')

const EXCLUDE_MEMBERSHIP_TYPES = ['MONTHLY_ABO']

const changeover = async (
  { runDry },
  { pgdb, mail: { enforceSubscriptions } }
) => {
  const endDate = moment()

  const users = await pgdb.public.query(`
    WITH users AS (
      -- Active memberships and their MAX(membershipPeriods.endDate)
      SELECT m.*, MAX(mp."endDate") AS "endDate"
      FROM memberships m
      INNER JOIN "membershipPeriods" mp
        ON m.id = mp."membershipId"
      INNER JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
        AND mt.name NOT IN (:EXCLUDE_MEMBERSHIP_TYPES)
      WHERE
        m.active = true
      GROUP BY m.id
    )
    SELECT DISTINCT("userId") AS id FROM users
    WHERE
      -- Potential ending memberships to change over to dormant membership
      "endDate" < :endDate
  `, { EXCLUDE_MEMBERSHIP_TYPES, endDate })

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
      const dormantMemberships = findDormantMemberships({
        memberships: userMemberships,
        user: { id: user.id }
      })

      // End here if there is not dormant membership to be found
      if (dormantMemberships.length < 1) {
        return
      }

      // Elect a dormant membership to activate. Rule is to elect dorman
      // membership with lowest sequenceNumber
      const electedDormantMembership = dormantMemberships.reduce(
        (acc, curr) =>
          !acc || curr.sequenceNumber < acc.sequenceNumber
            ? curr
            : acc
      )

      debug({
        activeMembership: activeMembership.id,
        electedDormantMembership: electedDormantMembership.id,
        runDry
      })

      stats.changeover++

      if (runDry) {
        return
      }

      const transaction = await pgdb.transactionBegin()

      try {
        const now = moment()

        await transaction.public.memberships.update(
          { id: activeMembership.id },
          { active: false, renew: false, updatedAt: now }
        )

        await transaction.public.memberships.updateOne(
          { id: electedDormantMembership.id },
          {
            active: true,
            renew: true,
            sequenceNumber: activeMembership.sequenceNumber,
            updatedAt: now
          }
        )

        const beginDate = now
        const endDate = beginDate.clone().add(
          electedDormantMembership.initialPeriods,
          electedDormantMembership.initialInterval
        )

        await transaction.public.membershipPeriods.insert({
          membershipId: electedDormantMembership.id,
          beginDate,
          endDate,
          kind: 'CHANGEOVER',
          createdAt: now,
          updatedAt: now
        })

        createCache({ prefix: `User:${user.id}` }).invalidate()

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

  debug({ stats, runDry })
}

module.exports = {
  changeover
}
