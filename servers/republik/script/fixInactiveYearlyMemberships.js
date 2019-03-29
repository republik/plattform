/**
 * This script activates memberships.
 * This script assumes that all entries in the memberships table
 * are yearly memberships.
 *
 * Usage:
 * node script/activateYearlyMemberships.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { enforceSubscriptions } = require('../modules/crowdfundings/lib/Mail')
const activateYearlyMembership = require('../modules/crowdfundings/lib/activateYearlyMembership')

console.log('running activateMemberships.js...')

const dryRun = process.argv[2] !== '--commit'

if (dryRun) {
  console.log('dry run, no changes will be applied, add --commit to apply changes')
}

PgDb.connect().then(async pgdb => {
  const enforceSubscriptionsUserIds = []
  const transaction = await pgdb.transactionBegin()
  try {
    const usersWithMemberships = await transaction.query(`
      SELECT
        u.*,
        json_agg(m.*) as memberships
      FROM
        users u
      JOIN
        memberships m
        ON m."userId" = u.id
      GROUP BY
        u.id
    `)

    for (let user of usersWithMemberships) {
      if (user.email === 'jefferson@project-r.construction') {
        continue
      }
      if (user.memberships.find(m => m.active)) {
        continue
      }
      const membership = await activateYearlyMembership(
        user.memberships,
        transaction,
        dryRun
      )
      if (membership) {
        console.log('activating', user.email, membership.sequenceNumber)
        enforceSubscriptionsUserIds.push(user.id)
      }
    }

    // commit transaction
    await transaction.transactionCommit()

    try {
      await Promise.all(enforceSubscriptionsUserIds.map(userId =>
        enforceSubscriptions({
          pgdb,
          userId
        })
      ))
    } catch (e) {
      console.error('enforceSubscriptions failed', enforceSubscriptionsUserIds, e)
    }
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { error: e })
    throw e
  }
})
