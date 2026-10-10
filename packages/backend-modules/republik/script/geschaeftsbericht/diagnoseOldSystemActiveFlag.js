#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { DEFAULT_AS_OF, endOfDayInZurich } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// lib/membershipCategorizedCte.js's old_rows CTE has never checked
// "memberships".active — only whether a membershipPeriods row's date range
// covers the snapshot date. This is structurally the same class of bug as
// the stale-invoice-period issue already fixed for the new payments system
// (see lib/membershipCategorizedCte.js's comment on that fix): a membership
// can be deactivated (active = false, e.g. manually closed, refunded,
// fraud, account merge) while its last membershipPeriods row still
// nominally covers the snapshot date, because periods aren't retroactively
// shortened when a membership is deactivated. This checks how big that
// effect is, overall and specifically for ABO_GIVE gift memberships (where
// a stale "als Geschenk" over-count was found — see
// diagnoseGiftDefinition.js / diagnoseGiftStockVsFlow.js /
// diagnoseGiftRenewSplit.js, none of which explained the gap).
const QUERY = `
SELECT
  mt.name AS type_name,
  m.active,
  COUNT(*)::int AS count
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" != ALL($2::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
  )
GROUP BY mt.name, m.active
ORDER BY mt.name, m.active
`

const GIFT_QUERY = `
SELECT
  m.active,
  COUNT(*)::int AS count
FROM "memberships" m
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "pledges" p ON p.id = m."pledgeId"
JOIN "packages" pkg ON pkg.id = p."packageId"
WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" != ALL($2::uuid[])
  AND NOT EXISTS (
    SELECT 1 FROM pledges pex
    WHERE pex.id = m."pledgeId" AND pex."userId" = ANY($2::uuid[])
  )
  AND mt.name = 'ABO'
  AND pkg."name" = 'ABO_GIVE'
GROUP BY m.active
ORDER BY m.active
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'point in time to check, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    console.log(`old-system memberships with a period covering ${argv.asOf.format('YYYY-MM-DD')}, split by type + active flag …\n`)

    const rows = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(rows)

    console.log('\nsame split, ABO_GIVE gift memberships only:')
    const giftRows = await pgdb.query(GIFT_QUERY, [asOf, EXCLUDED_USER_IDS])
    console.table(giftRows)

    console.log(
      '\nany active=false rows above are counted as active by the current query',
      "but shouldn't be — that's the bug, if present.",
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
