/**
 * This script fixes an election issue of activateMemberships.js
 * which was fixed with the creation of this file.
 *
 * Usage:
 * node script/launch/fixActivateMemberships.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { ascending } = require('d3-array')

console.log('running fixActivateMemberships.js...')
PgDb.connect().then(async pgdb => {
  const transaction = await pgdb.transactionBegin()
  try {
    const benefactorMembershipType = await transaction.public.membershipTypes.findOne({ name: 'BENEFACTOR_ABO' })
    const usersWithMultMemberships = await transaction.query(`
      select
        u.*,
        json_agg(m.*) as memberships
      from
        users u join memberships m on m."userId" = u.id
      where
        u.email != 'jefferson@project-r.construction'
      group by 1
      having count(m.id) > 1
    `)

    let count = 0
    for (let user of usersWithMultMemberships) {
      const voucheredMemberships = (await transaction.query(`
        SELECT m.*
        FROM memberships m
        JOIN pledges p
        ON m."pledgeId" = p.id
        WHERE p."userId" != m."userId" AND ARRAY[m.id] && :membershipIds
      `, {
        membershipIds: user.memberships.map(m => m.id)
      }))
        .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))

      const reducedPriceMembership = user.memberships.find(m => m.reducedPrice)

      const benefactorMemberships = user.memberships
        .filter(membership => membership.membershipTypeId === benefactorMembershipType.id)
        .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))

      const smallestSeqMembership = user.memberships
        .sort((a, b) => ascending(a.sequenceNumber, b.sequenceNumber))
        .concat().shift()

      const electedMembership = voucheredMemberships[0] ||
        reducedPriceMembership ||
        benefactorMemberships[0] ||
        smallestSeqMembership

      const activeMembership = user.memberships.find(m => m.active)
      if (electedMembership.id !== activeMembership.id) {
        // console.log(user.email)
        // console.log('active', activeMembership)
        // console.log('electedMembership', electedMembership)
        // console.log('--------------------------------------------------')
        await transaction.public.membershipPeriods.updateOne(
          { membershipId: activeMembership.id },
          { membershipId: electedMembership.id }
        )
        await transaction.public.memberships.updateOne(
          { id: electedMembership.id },
          {
            voucherCode: activeMembership.voucherCode,
            voucherable: activeMembership.voucherable,
            active: activeMembership.active,
            renew: activeMembership.renew
          }
        )
        await transaction.public.memberships.updateOne(
          { id: activeMembership.id },
          {
            voucherCode: electedMembership.voucherCode,
            voucherable: electedMembership.voucherable,
            active: electedMembership.active,
            renew: electedMembership.renew
          }
        )
        count += 1
      }
    }
    console.log(count)
    // set voucherable false for memberships without voucherCode
    await transaction.query(`
      UPDATE memberships
      SET voucherable = false
      WHERE "voucherCode" is null
    `)

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
