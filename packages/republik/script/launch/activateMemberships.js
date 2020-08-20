/**
 * This script activates memberships.
 * This script assumes that all entries in the memberships table
 * are yearly memberships.
 *
 * Usage:
 * node script/launch/activeMemberships.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const moment = require('moment')
const { ascending } = require('d3-array')

console.log('running activateMemberships.js...')
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

    const benefactorMembershipType = await transaction.public.membershipTypes.findOne({ name: 'BENEFACTOR_ABO' })

    let max = 0
    const beginDate = new Date('2018-01-15T12:00:00.000+01:00')
    const endDate = moment(beginDate).add(1, 'year')
    for (let user of usersWithMemberships) {
      if (user.email === 'jefferson@project-r.construction') {
        continue
      }
      max = Math.max(max, user.memberships.length)
      let electedMembership

      if (user.memberships.length === 1) {
        electedMembership = user.memberships[0]
      } else {
        const membershipsWithoutVoucherCode = user.memberships
          .filter(membership => membership.voucherCode === null)
          .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))
        if (membershipsWithoutVoucherCode.length > 1) {
          console.warn('multiple memberships without voucherCode!!!!!!!!', user.memberships)
        }

        const reducedPriceMembership = user.memberships.find(m => m.reducedPrice)

        const benefactorMemberships = user.memberships
          .filter(membership => membership.membershipTypeId === benefactorMembershipType.id)
          .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))

        const smallestSeqMembership = user.memberships
          .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))
          .concat().shift()

        electedMembership = membershipsWithoutVoucherCode[0] ||
          reducedPriceMembership ||
          benefactorMemberships[0] ||
          smallestSeqMembership
      }

      await transaction.public.memberships.update({
        id: electedMembership.id
      }, {
        active: true,
        renew: true,
        voucherCode: null,
        voucherable: false
      })

      await transaction.public.membershipPeriods.insert({
        membershipId: electedMembership.id,
        pledgeId: electedMembership.pledgeId,
        beginDate,
        endDate
      })

      // console.log('-------')
      // console.log(user.email, user.memberships)
      // console.log('electedMembership', electedMembership)
    }

    console.log('usersWithMemberships:', usersWithMemberships.length)
    console.log('max memberships:', max)
    console.log('memberships !active:', await transaction.public.memberships.count({active: false}), '\n')

    // commit transaction
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { error: e })
    throw e
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
