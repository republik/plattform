#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearStartFromAsOf,
} = require('./lib/dates')

// Second original query the user provided (labelled "-- REDUCED --" in
// their source, though its condition is the payer-mismatch gift signal, not
// a reduced-price one — likely just a stray/adjacent section header from
// wherever this was copied from). Pledge-based (not membership-based),
// broken down by package name, so it shows exactly which packages drive the
// payer-mismatch signal — useful for narrowing
// diagnoseOriginalGiftQuery.js's ledger down further.
const QUERY = `
SELECT
  date_trunc('month', p."createdAt") AS txn_month,
  pak.name AS package_name,
  count(*)::int AS count
FROM pledges p
JOIN memberships m ON m."pledgeId" = p.id
JOIN packages pak ON pak.id = p."packageId"
WHERE p.status != 'DRAFT'
  AND p."userId" != m."userId"
  AND p."createdAt" > '2017-06-01'
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
      `running the original pledge-based payer-mismatch query, then summing rows within FY ${fyStart.format('YYYY-MM-DD')}–${fyEnd.format('YYYY-MM-DD')} …\n`,
    )

    const rows = await pgdb.query(QUERY, [])
    const inRange = rows.filter((r) => {
      const d = new Date(r.txn_month)
      return d >= fyStart.toDate() && d <= fyEnd.toDate()
    })

    console.log(`${inRange.length} (month, package) rows fall within this fiscal year:`)
    console.table(
      inRange.map((r) => ({ ...r, txn_month: new Date(r.txn_month).toISOString().slice(0, 7) })),
    )

    const totalsByPackage = {}
    inRange.forEach((r) => {
      totalsByPackage[r.package_name] = (totalsByPackage[r.package_name] || 0) + r.count
    })
    console.log('\ntotals by package across the fiscal year:')
    console.table(
      Object.entries(totalsByPackage).map(([package_name, count]) => ({ package_name, count })),
    )
    const grandTotal = inRange.reduce((sum, r) => sum + r.count, 0)
    console.log(`\ngrand total across all packages this fiscal year: ${grandTotal}`)
    console.log('compare against the published 655.')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
