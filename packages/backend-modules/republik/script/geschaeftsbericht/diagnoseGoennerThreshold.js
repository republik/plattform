#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

// Checks two leads for the Gönnermitgliedschaft mismatch (154 here vs. 136
// published, at 2025-06-30):
//  1) does any EXCLUDED_USER_IDS account currently hold a BENEFACTOR_ABO
//     membership? (would show up as an unfiltered row here — our own count
//     already excludes these, so this only matters if the exclusion has a
//     gap)
//  2) per the user: "Gönner" sometimes means anyone who has spent at least
//     CHF 1000 WITHIN THE FISCAL YEAR (not lifetime), independent of formal
//     membership type (BENEFACTOR_ABO). pledges.total is in Rappen (cents),
//     so CHF 1000 = 100000. This checks, among users who hold ANY active
//     membership/subscription at asOf, how many have successful pledge
//     totals created during this fiscal year summing to >= CHF 1000 —
//     compare against both 136 (published) and 154 (current
//     BENEFACTOR_ABO-only count).
const EXCLUDED_HOLDING_BENEFACTOR_QUERY = `
SELECT m.id::text AS membership_id, m."userId", u.email
FROM "memberships" m
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
JOIN "users" u ON u.id = m."userId"
WHERE mt.name = 'BENEFACTOR_ABO'
  AND mp."beginDate" < $1 AND mp."endDate" >= $1
  AND m."userId" = ANY($2::uuid[])
`

const SPEND_THRESHOLD_QUERY = `
WITH active_users AS (
  SELECT DISTINCT m."userId" AS "userId"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
    AND m."userId" != ALL($2::uuid[])
  UNION
  SELECT DISTINCT s."userId" AS "userId"
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
    AND s."userId" != ALL($2::uuid[])
    AND s.status NOT IN ('incomplete', 'incomplete_expired')
),
pledge_totals AS (
  SELECT p."userId", SUM(p.total)::bigint AS total_rappen
  FROM pledges p
  WHERE p.status = 'SUCCESSFUL'
    AND p."userId" != ALL($2::uuid[])
    AND p."createdAt" >= $3 AND p."createdAt" < $1
  GROUP BY p."userId"
)
SELECT COUNT(*)::int AS count
FROM active_users au
JOIN pledge_totals pt ON pt."userId" = au."userId"
WHERE pt.total_rappen >= 100000
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'point-in-time snapshot, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const asOf = argv.asOf.toDate()
    const fyStart = fiscalYearStartFromAsOf(argv.asOf).toDate()

    console.log(`checking for excluded accounts holding a BENEFACTOR_ABO membership at ${argv.asOf.format('YYYY-MM-DD')} …\n`)
    const excludedHolders = await pgdb.query(EXCLUDED_HOLDING_BENEFACTOR_QUERY, [asOf, EXCLUDED_USER_IDS])
    if (excludedHolders.length) {
      console.table(excludedHolders)
    } else {
      console.log('none found — no excluded/test account currently holds a Gönner membership.')
    }

    console.log('\nchecking CHF 1000+ spend WITHIN THIS FISCAL YEAR among currently active members …\n')
    const [row] = await pgdb.query(SPEND_THRESHOLD_QUERY, [asOf, EXCLUDED_USER_IDS, fyStart])
    console.log(`active members with this-fiscal-year successful pledge total >= CHF 1000: ${row.count}`)
    console.log('compare against published Gönnermitgliedschaft (136) and current BENEFACTOR_ABO-only count (154)')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
