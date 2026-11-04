#!/usr/bin/env node
// Full detail dump for the 9 ids found by diagnoseExactReconciliation.js
// to disagree between the diff-based (exact) net and the lifecycle-based
// net for Total Mitgliedschaften, FY2025-2026. Together these 9 ids
// account for the entire +13 gap.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const IDS = [
  '26c0284f-183d-4642-ae98-07aa4134bc27', // diffNet=1 lifecycleNet=8 gap=7
  'f06ef0ac-458d-4196-bfb9-9d842e6814f0', // diffNet=-1 lifecycleNet=0 gap=1
  '3c059929-e561-4b2c-863c-297e064161b9',
  '6fc37486-f8b8-4142-9cf6-91e8942b42cb',
  '35432564-4145-4fe1-b832-8ec38a12ce67',
  '3aedbef4-3ceb-4636-a360-e50c27036b36',
  '74740f02-d34b-42a3-8b2a-e394dc474211', // diffNet=0 lifecycleNet=1 gap=1
  'c1b166ea-f626-425b-8fdb-dcf7a7a0cd11',
  'bbb692ee-9205-459b-8ca2-3e8a75d20be1', // diffNet=0 lifecycleNet=-1 gap=-1
]

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    for (const id of IDS) {
      console.log(`\n===== ${id} =====`)

      const sub = await pgdb.query(
        `SELECT id, "userId", type, status, "createdAt", "currentPeriodStart", "currentPeriodEnd", "endedAt", "cancelAt"
         FROM payments.subscriptions WHERE id = $1`,
        [id],
      )
      if (sub.length) {
        console.log('NEW-SYSTEM subscription:', sub[0])
        const invoices = await pgdb.query(
          `SELECT id, status, "periodStart", "periodEnd", "totalDiscountAmount", "createdAt"
           FROM payments.invoices WHERE "subscriptionId" = $1 ORDER BY "periodStart"`,
          [id],
        )
        console.log(`  ${invoices.length} invoices:`)
        invoices.forEach((i) =>
          console.log(`    ${i.id} status=${i.status} period=${i.periodStart.toISOString().slice(0,10)}..${i.periodEnd.toISOString().slice(0,10)} discount=${i.totalDiscountAmount}`),
        )
        continue
      }

      const mem = await pgdb.query(
        `SELECT m.id, m."userId", mt.name AS type_name, m."reducedPrice", m.renew, m."voucherCode", m."pledgeId"
         FROM "memberships" m JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
         WHERE m.id = $1`,
        [id],
      )
      if (mem.length) {
        console.log('OLD-SYSTEM membership:', mem[0])
        const periods = await pgdb.query(
          `SELECT id, "beginDate", "endDate", "pledgeId" FROM "membershipPeriods" WHERE "membershipId" = $1 ORDER BY "beginDate"`,
          [id],
        )
        console.log(`  ${periods.length} periods:`)
        periods.forEach((p) =>
          console.log(`    ${p.id} ${p.beginDate.toISOString().slice(0,10)}..${p.endDate.toISOString().slice(0,10)} pledge=${p.pledgeId}`),
        )
        continue
      }

      console.log('NOT FOUND in either table (unexpected)')
    }
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
