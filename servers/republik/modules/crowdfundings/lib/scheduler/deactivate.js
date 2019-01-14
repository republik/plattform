const debug = require('debug')('crowdfundings:lib:scheduler:deactivate')
const moment = require('moment')
const Promise = require('bluebird')

const createCache = require('../cache')
const { activeMembershipsQuery } = require('./changeover')

// Amount of days before a cancelled membership (renew=false) is deactivated
// after last membership periods end
const CANCELLED_GRACE_PERIOD_DAYS = 0

// Amount of days before an uncancelled membership (renew=true) is deactivated
// after last membership periods end
const UNCANCELLED_GRACE_PERIOD_DAYS = 14

const deactivate = async (
  { dryRun },
  { pgdb, mail: { enforceSubscriptions } }
) => {
  const cancelledEndDate =
    moment().startOf('day').subtract(CANCELLED_GRACE_PERIOD_DAYS, 'days')
  const uncancelledEndDate =
    moment().startOf('day').subtract(UNCANCELLED_GRACE_PERIOD_DAYS, 'days')

  const memberships = await pgdb.public.query(`
    WITH md AS (${activeMembershipsQuery})
    SELECT * FROM md
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
    dryRun
  })

  await Promise.each(
    memberships,
    async membership => {
      debug({ membership: membership.id })
      if (dryRun) {
        return
      }

      const transaction = await pgdb.transactionBegin()

      try {
        await transaction.public.memberships.update(
          { id: membership.id },
          { active: false, updatedAt: moment() }
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
