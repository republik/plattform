/**
 * This script activates memberships.
 * This script assumes that all entries in the memberships table
 * are yearly memberships.
 *
 * Usage:
 * node script/activateYearlyMemberships.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const moment = require('moment')
const { enforceSubscriptions } = require('../modules/crowdfundings/lib/Mail')

console.log('running activateMemberships.js...')

const dryRun = process.argv[2] !== '--commit'

if (dryRun) {
  console.log('dry run, no changes will be applied, add --commit to apply changes')
}

PgDb.connect().then(async pgdb => {
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

    const membershipTypeIndex = (
      await transaction.public.membershipTypes.findAll()
    ).reduce(
      (index, type) => {
        index[type.id] = type
        return index
      },
      {}
    )
    const packagesIndex = (
      await transaction.public.packages.findAll()
    ).reduce(
      (index, p) => {
        index[p.id] = p
        return index
      },
      {}
    )

    for (let user of usersWithMemberships) {
      if (user.email === 'jefferson@project-r.construction') {
        continue
      }
      if (user.memberships.find(m => m.active)) {
        continue
      }
      const yearlyMemberships = user.memberships.filter(m => membershipTypeIndex[m.membershipTypeId].name !== 'MONTHLY_ABO')
      if (!yearlyMemberships.length) {
        continue
      }

      const pledges = await Promise.all(user.memberships.map(m => transaction.public.pledges.findOne({id: m.pledgeId})))

      const notGiveYearlyMemberships = yearlyMemberships.filter(m => {
        const pledge = pledges.find(p => p.id === m.pledgeId)
        return packagesIndex[pledge.packageId].name !== 'ABO_GIVE'
      })
      if (!notGiveYearlyMemberships.length) {
        continue
      }

      if (notGiveYearlyMemberships.length === 1) {
        const membership = notGiveYearlyMemberships[0]
        console.log('activating', user.email, membership.sequenceNumber)
        if (dryRun) {
          continue
        }

        const beginDate = new Date() // now
        const endDate = moment(beginDate).add(1, 'year')
        await transaction.public.memberships.update({
          id: membership.id
        }, {
          active: true,
          renew: true,
          voucherCode: null,
          voucherable: false
        })

        await transaction.public.membershipPeriods.insert({
          membershipId: membership.id,
          beginDate,
          endDate
        })

        try {
          await enforceSubscriptions({
            pgdb,
            userId: user.id
          })
        } catch (e) {
          console.error('enforceSubscriptions failed for', user.email, e)
        }
      } else {
        console.log('unclear case', user.email)
        console.log(user.membership)
        console.log(pledges)
      }
    }

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { error: e })
    throw e
  }
})
