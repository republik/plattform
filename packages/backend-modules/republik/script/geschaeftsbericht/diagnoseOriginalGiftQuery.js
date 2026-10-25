#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')

// Runs the query the user provided (very likely the actual original query
// behind last year's "Mitgliedschaft als Geschenk" figure) verbatim, and
// sums it up per fiscal year + category so it can be compared directly
// against the published 655 (FY24/25). Key differences from everything
// tried in diagnoseGift*.js so far:
//   - keyed by m."createdAt" (membership creation month) with NO period/
//     activity filtering at all — a pure creation-month ledger, not a
//     point-in-time snapshot
//   - gift condition is (payer != holder OR voucherCode IS NOT NULL) — no
//     ABO_GIVE package restriction, applies across all membership types
//   - excludes only one specific hardcoded test account, not this folder's
//     full EXCLUDED_USER_IDS list
//   - the ", uneingelöst" suffix marks still-unredeemed gift vouchers
//     separately from ones already claimed
const QUERY = `
SELECT
  date_trunc('month', m."createdAt") AS month,
  mt.name || (CASE WHEN m."voucherCode" IS NULL THEN '' ELSE ', uneingelöst' END) AS label,
  count(*)::int AS count
FROM memberships m
JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
JOIN pledges p ON p.id = m."pledgeId"
WHERE (m."userId" != p."userId" OR m."voucherCode" IS NOT NULL)
  AND m."userId" != (SELECT id FROM users WHERE email = 'jefferson@project-r.construction')
GROUP BY 1, 2
ORDER BY 1
`

const run = async () => {
  const argv = yargs
    .option('asOf', {
      describe: 'fiscal year end, end-of-day Europe/Zurich',
      coerce: endOfDayInZurich,
      default: endOfDayInZurich(DEFAULT_AS_OF),
    })
    .help()
    .version().argv

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })
  try {
    const fyStart = fiscalYearStartFromAsOf(argv.asOf)
    const fyEnd = argv.asOf
    console.log(
      `running the original gift ledger query, then summing rows within FY ${fyStart.format('YYYY-MM-DD')}–${fyEnd.format('YYYY-MM-DD')} …\n`,
    )

    const rows = await pgdb.query(QUERY, [])
    const inRange = rows.filter((r) => {
      const d = new Date(r.month)
      return d >= fyStart.toDate() && d <= fyEnd.toDate()
    })

    console.log(`${inRange.length} (month, label) rows fall within this fiscal year:`)
    console.table(inRange.map((r) => ({ ...r, month: new Date(r.month).toISOString().slice(0, 7) })))

    const totalsByLabel = {}
    inRange.forEach((r) => {
      totalsByLabel[r.label] = (totalsByLabel[r.label] || 0) + r.count
    })
    console.log('\ntotals by label across the fiscal year:')
    console.table(
      Object.entries(totalsByLabel).map(([label, count]) => ({ label, count })),
    )
    console.log(
      "\ncompare 'ABO' (redeemed, no suffix) — and 'ABO' + 'ABO, uneingelöst' combined — against the published 655.",
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
