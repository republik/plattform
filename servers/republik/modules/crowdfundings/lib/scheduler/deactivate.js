const debug = require('debug')('crowdfundings:lib:scheduler:deactivate')
const moment = require('moment')
const Promise = require('bluebird')

// Amount of days before a cancelled membership is deactivated after membership
// periods end
const CANCELLED_GRACE_PERIOD_DAYS = 0

// Amount of days before an uncancelled uncancelled membership is deactivated
// after membership periods end
const UNCANCELLED_GRACE_PERIOD_DAYS = 14

const deactivate = async (args, { pgdb, mail: { enforceSubscriptions } }) => {
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
      GROUP BY 1, 2
    ) AS md
    WHERE
      -- Cancelled memberships
      ( md.renew = false AND "endDate" < :cancelledEndDate )
      OR
      -- Uncancelled memberships (flagged to renew, but were not)
      ( md.renew = true AND "endDate" < :uncancelledEndDate )
    LIMIT 1000
  `, { cancelledEndDate, uncancelledEndDate })

  debug({
    cancelledEndDate: cancelledEndDate.toDate(),
    uncancelledEndDate: uncancelledEndDate.toDate(),
    memberships: memberships.length
  })

  await Promise.map(
    memberships,
    async membership => {
      await pgdb.public.memberships.update(
        { id: membership.id },
        { active: false, renew: false, updatedAt: moment() }
      )

      await enforceSubscriptions({ userId: membership.userId, pgdb })
    },
    { concurrency: 10 }
  )
}

module.exports = {
  deactivate
}
