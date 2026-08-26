#!/usr/bin/env node
// Ad-hoc diagnostic: old-system gift vouchers (ABO / ABO_GIVE_MONTHS with
// voucherCode set) create an active membershipPeriods row the moment
// they're PURCHASED (before anyone redeems them) -- see
// lib/membershipCategorizedCte.js's is_unredeemed comment. The count query
// routes these to a separate "...uneingelöst" bucket, excluded from
// MITGLIEDSCHAFTEN_CATEGORIES/ABONNEMENTE_CATEGORIES (lib/membershipCategories.js)
// until redeemed. But LIFECYCLE_CATEGORIZED_CTE
// (lib/membershipLifecycleCte.js) has NO "uneingelöst" branch at all --
// every ABO-type old membership, voucher or not, gets classified straight
// into a real, counted category (e.g. "Mitgliedschaft als Geschenk") with
// its lifecycle "gain" firing at PURCHASE time. If the voucher is still
// unredeemed at fiscal year end, net already recorded the gain, but count
// never did -- a phantom, unmatched net overstatement.
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const FY_START = '2025-07-01'
const FY_END = '2026-06-30'

const QUERY = `
SELECT m.id, m."userId", mt.name AS type_name, mp."beginDate", mp."endDate"
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
WHERE m."userId" != ALL($1::uuid[])
  AND m."voucherCode" IS NOT NULL
  AND mt.name IN ('ABO', 'ABO_GIVE_MONTHS')
  AND mp."beginDate" >= $2 AND mp."beginDate" <= $3
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($1::uuid[])
  )
ORDER BY mp."beginDate"
`

const run = async () => {
  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht-diagnose' })
  try {
    const rows = await pgdb.query(QUERY, [EXCLUDED_USER_IDS, FY_START, FY_END])
    console.log(`unredeemed gift vouchers (old system) purchased within FY, still unredeemed as of ${FY_END}: ${rows.length}`)
    rows.forEach((r) =>
      console.log(`  ${r.id} type=${r.type_name} beginDate=${r.beginDate.toISOString().slice(0,10)} endDate=${r.endDate.toISOString().slice(0,10)}`),
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
