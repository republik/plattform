const debug = require('debug')('crowdfundings:lib:scheduler:deactivate')
const moment = require('moment')
const Promise = require('bluebird')

const createCache = require('../cache')
const { activeMembershipsQuery } = require('./changeover')

const deactivate = async (
  { dryRun },
  { pgdb, mail: { sendMembershipDeactivated, enforceSubscriptions }, t, redis }
) => {
  const cancelledEndDate = moment().startOf('day')

  const memberships = await pgdb.public.query(`
    WITH memberships AS (${activeMembershipsQuery})
    SELECT * FROM memberships
    WHERE
      -- Cancelled memberships
      ( renew = false AND "endDate" < :cancelledEndDate )
      OR
      -- Uncancelled memberships (flagged to renew, but were not)
      ( renew = true AND "endDate" + "graceInterval" < :cancelledEndDate )
  `, { cancelledEndDate })

  debug({
    cancelledEndDate: cancelledEndDate.toDate(),
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

        createCache({ prefix: `User:${membership.userId}` }, { redis }).invalidate()

        await transaction.transactionCommit()
      } catch (e) {
        await transaction.transactionRollback()
        console.log('transaction rollback', { membership, error: e })
        throw e
      }

      await enforceSubscriptions({ userId: membership.userId, pgdb })

      if (membership.renew) {
        await sendMembershipDeactivated({ membership, pgdb, t })
      }
    }
  )
}

module.exports = {
  deactivate
}
