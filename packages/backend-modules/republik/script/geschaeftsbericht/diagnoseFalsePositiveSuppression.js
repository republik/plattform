#!/usr/bin/env node
// Investigate why the cross-system dedup fix in membershipLifecycleCte.js
// wrongly suppresses a real "gain" for these old-system membership ids
// (they DO get counted by the point-in-time count query -- diffNet=1 --
// but the fixed lifecycle query now reports lifecycleNet=0 for them).
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const IDS = [
  '3e09aad7-644a-4274-ab46-987a544fc9b4',
  'f5f4ce29-ff30-4cb5-901d-a5f2a0ee5ff0',
  'ac2e206e-d84d-4a35-9f51-d4fab4938a61',
  '0c5824da-2658-47e6-b6bd-825299cc96fb',
  '15f7494b-4d7e-4720-b0d7-d773fcf18034',
]

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    for (const id of IDS) {
      console.log(`\n===== ${id} =====`)
      const mem = await pgdb.query(
        `SELECT m.id, m."userId", mt.name AS type_name, m.renew, m."voucherCode"
         FROM "memberships" m JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
         WHERE m.id = $1`,
        [id],
      )
      if (!mem.length) {
        console.log('not an old-system membership id (unexpected)')
        continue
      }
      console.log('membership:', mem[0])
      const periods = await pgdb.query(
        `SELECT id, "beginDate", "endDate" FROM "membershipPeriods" WHERE "membershipId" = $1 ORDER BY "beginDate"`,
        [id],
      )
      periods.forEach((p) =>
        console.log(`  period ${p.beginDate.toISOString().slice(0,10)}..${p.endDate.toISOString().slice(0,10)}`),
      )
      const userId = mem[0].userId
      // any new-system subscription for this user, and whether any of its
      // invoices cover the membership's first_start (= earliest period
      // beginDate for a single-segment membership)
      const firstStart = periods[0].beginDate
      const subs = await pgdb.query(
        `SELECT s.id, s.status, s."createdAt", s."endedAt", s."cancelAt"
         FROM payments.subscriptions s WHERE s."userId" = $1`,
        [userId],
      )
      console.log(`  user has ${subs.length} new-system subscription(s):`)
      for (const s of subs) {
        console.log(`    ${s.id} status=${s.status} createdAt=${s.createdAt.toISOString().slice(0,10)} endedAt=${s.endedAt} cancelAt=${s.cancelAt}`)
        const invoices = await pgdb.query(
          `SELECT id, status, "periodStart", "periodEnd" FROM payments.invoices WHERE "subscriptionId" = $1 ORDER BY "periodStart"`,
          [s.id],
        )
        invoices.forEach((i) =>
          console.log(`      invoice ${i.id} status=${i.status} period=${i.periodStart.toISOString().slice(0,10)}..${i.periodEnd.toISOString().slice(0,10)} coversFirstStart=${i.periodStart < firstStart && i.periodEnd >= firstStart}`),
        )
      }
    }
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
