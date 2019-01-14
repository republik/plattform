const debug = require('debug')('crowdfundings:lib:scheduler:deactivate')
const moment = require('moment')
const Promise = require('bluebird')

const createCache = require('../cache')

// Amount of days before a cancelled membership is deactivated after membership
// periods end
const CANCELLED_GRACE_PERIOD_DAYS = 0

// Amount of days before an uncancelled uncancelled membership is deactivated
// after membership periods end
const UNCANCELLED_GRACE_PERIOD_DAYS = 14

const deactivate = async (
  { runDry },
  { pgdb, mail: { enforceSubscriptions } }
) => {
  const cancelledEndDate =
    moment().startOf('day').subtract(CANCELLED_GRACE_PERIOD_DAYS, 'days')
  const uncancelledEndDate =
    moment().startOf('day').subtract(UNCANCELLED_GRACE_PERIOD_DAYS, 'days')

  const memberships = await pgdb.public.query(`
    SELECT * FROM (
      -- Active memberships and their MAX(membershipPeriods.endDate)
      SELECT m.*, MAX(mp."endDate") AS "endDate"
      FROM memberships m
      INNER JOIN "membershipPeriods" mp
        ON m.id = mp."membershipId"
      INNER JOIN "membershipTypes" mt
        ON m."membershipTypeId" = mt.id
        AND mt.name != 'MONTHLY_ABO' -- Exclude subscription via Stripe
      WHERE
        m.active = true
      GROUP BY 1
    ) AS md
    WHERE
      -- Cancelled memberships
      ( md.renew = false AND "endDate" < :cancelledEndDate )
      OR
      -- Uncancelled memberships (flagged to renew, but were not)
      ( md.renew = true AND "endDate" < :uncancelledEndDate )
  `, { cancelledEndDate, uncancelledEndDate })

  debug({
    cancelledEndDate: cancelledEndDate.toDate(),
    uncancelledEndDate: uncancelledEndDate.toDate(),
    memberships: memberships.length,
    runDry
  })

  if (runDry) {
    debug('dry run')
    return
  }

  await Promise.each(
    memberships,
    async membership => {
      debug({ membership: membership.id })
      if (runDry) {
        return
      }

      const transaction = await pgdb.transactionBegin()

      try {
        await transaction.public.memberships.update(
          { id: membership.id },
          { active: false, renew: false, updatedAt: moment() }
        )

        createCache({ prefix: `User:${membership.userId}` }).invalidate()

        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()
        console.log('transaction rollback', { membership, error: e })
        throw e
      }

      await enforceSubscriptions({ userId: membership.userId, pgdb })
    }
  )
}

module.exports = {
  deactivate
}
