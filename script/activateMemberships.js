/**
 * This script activates memberships.
 * This script assumes that all entries in the memberships table
 * are yearly memberships.
 *
 * Usage:
 * node script/activeMemberships.js
 */
require('dotenv').config()

const { lib: { pgdb: PgDb } } = require('@orbiting/backend-modules-base')
const moment = require('moment')

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

    const benefactorMembershipType = await transaction.query(`
      SELECT *
      FROM "membershipTypes"
      WHERE name = 'BENEFACTOR_ABO'
    `)

    let max = 0
    let numRedeemed = 0
    const beginDate = new Date('2018-01-14T01:00:00.000+01:00')
    const endDate = moment(beginDate).add(1, 'year')
    for (let user of usersWithMemberships) {
      if (user.email === 'jefferson@project-r.construction') {
        continue
      }
      max = Math.max(max, user.memberships.length)
      let electedMembership

      const membershipsWithoutVoucherCode = user.memberships
        .filter(membership => membership.voucherCode === null)
      numRedeemed += membershipsWithoutVoucherCode.length

      if (user.memberships.length === 1) {
        electedMembership = user.memberships[0]
      } else {
        const benefactorMemberships = user.memberships
          .filter(membership => membership.membershipTypeId === benefactorMembershipType.id)

        electedMembership = membershipsWithoutVoucherCode[0] ||
          benefactorMemberships[0] ||
          user.memberships[0]
      }

      await transaction.public.memberships.update({
        id: electedMembership.id
      }, {
        active: true
      })

      await transaction.public.membershipPeriods.insert({
        membershipId: electedMembership.id,
        beginDate,
        endDate
      })

      if (membershipsWithoutVoucherCode.length > 1) {
        console.warn('multiple memberships without voucherCode!!!!!!!!', user.memberships)
      }
      // console.log('-------')
      // console.log(user.email, user.memberships)
      // console.log('electedMembership', electedMembership)
    }

    console.log('usersWithMemberships:', usersWithMemberships.length)
    console.log('numRedeemed:', numRedeemed)
    console.log('max memberships:', max)
    console.log('memberships !active:', await pgdb.public.memberships.count({active: false}))

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
