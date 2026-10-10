#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
const yargs = require('yargs')
const fs = require('fs')
const path = require('path')
const { csvFormat } = require('d3-dsv')

const TIMEZONE = 'Europe/Zurich'

// Parses a plain 'YYYY-MM-DD' as a calendar date in Europe/Zurich and
// returns the start/end instant of that day, timezone-aware — independent
// of whatever timezone the process itself runs in (e.g. Heroku defaults to
// UTC). Naively comparing `col AT TIME ZONE 'Europe/Zurich' BETWEEN
// '<bare-date>' AND '<bare-date>'` (the original version of this query)
// instead reinterprets the bare date strings in the DB session's own
// timezone, silently shifting the window by hours on a non-Zurich host.
const startOfDayInZurich = (dateStr) => dayjs.tz(dateStr, TIMEZONE).startOf('day')
const endOfDayInZurich = (dateStr) => dayjs.tz(dateStr, TIMEZONE).endOf('day')

// Fiscal years run 01.07.-30.06., so the start is always derivable from the
// end date.
const fiscalYearStartFromAsOf = (asOf) =>
  asOf.subtract(1, 'year').add(1, 'day').startOf('day')
const fiscalYearLabelFromAsOf = (asOf) => {
  const endYear = asOf.year()
  return `${endYear - 1}-${endYear}`
}

const argv = yargs
  .option('asOf', {
    describe:
      'fiscal year end (30.06.), e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich; the fiscal year always runs 01.07.-30.06.',
    coerce: endOfDayInZurich,
    demandOption: true,
  })
  .option('company', {
    describe: 'company name to filter on (companies.name)',
    string: true,
    default: 'PROJECT_R',
  })
  .option('method', {
    describe: 'payment method to filter on (payments.method)',
    string: true,
    default: 'STRIPE',
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// Stripe payment<->pledge reconciliation for the Jahresabschluss — NOT part
// of the Geschäftsbericht (see ../geschaeftsbericht) — this checks
// individual accounting bookings, not membership reporting. Originally an
// ad-hoc query run once per fiscal year (see "Stripe Differenz Payment <->
// Pledge per 30.6.2022" writeup).
//
// Accounting background: Auto-Pay (the automatic credit-card renewal of a
// membership) only ever charges the card for the person's OWN membership
// renewal — never for one-off items that were also on last year's pledge
// (books, gift memberships, donations/"Grosszügigkeit"), and doesn't
// account for later refunds/downgrades (e.g. Gönner -> normal membership).
// That produces a payments.total that legitimately differs from the
// pledges.total it's linked to, which this query surfaces per case for
// manual review and year-end booking corrections.
const QUERY = `
WITH data AS (
  SELECT
    pay.id "Payment-ID",
    pay."createdAt" "createdAt",
    pay."updatedAt" "updatedAt",
    pay.status,
    pay.method,
    c.name AS "Entität",
    p."userId" "User-ID",
    u."email" "E-Mail-Adresse",
    p.id "Pledge-ID",
    pay.total / 100 "Payment Total",
    p.total / 100 "Pledge Total",
    (pay.total - p.total) / 100 "Differenz Payment <-> Pledge"
  FROM "payments" pay
  JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
  JOIN "pledges" p ON p.id = ppay."pledgeId"
  JOIN "packages" pkgs ON pkgs.id = p."packageId"
  JOIN "companies" c ON c.id = pkgs."companyId"
  JOIN "users" u ON u.id = p."userId"
  WHERE
    (
      pay."createdAt" BETWEEN $1 AND $2
      OR pay."updatedAt" BETWEEN $1 AND $2
    )
    AND pay.method = $3
    AND c.name = $4
  GROUP BY pay.id, c.id, p.id, pkgs.id, u.id
  ORDER BY pay."createdAt", pay.id, c.id, p.id, pkgs.id, u.id
)
SELECT *
FROM data d
WHERE d."Differenz Payment <-> Pledge" != 0
`

const run = async () => {
  const fyStart = fiscalYearStartFromAsOf(argv.asOf)
  console.log(
    `checking ${argv.method} payment<->pledge differences for 01.07.${fyStart.format('YYYY')}-30.06.${argv.asOf.format('YYYY')}, company=${argv.company} …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'jahresabschluss' })
  try {
    const rows = await pgdb.query(QUERY, [
      fyStart.toDate(),
      argv.asOf.toDate(),
      argv.method,
      argv.company,
    ])

    const total = rows.reduce(
      (sum, r) => sum + Number(r['Differenz Payment <-> Pledge']),
      0,
    )
    console.log(
      `${rows.length} payments with a non-zero difference, summing to ${total.toFixed(2)}`,
    )

    const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
    fs.mkdirSync(argv.out, { recursive: true })
    const filename = `Stripe-Differenz-Payment-Pledge_FY${fyLabel}_${argv.company}_${dayjs().format('YYYY-MM-DD_HHmm')}.csv`
    const filePath = path.join(argv.out, filename)
    fs.writeFileSync(filePath, csvFormat(rows))
    console.log(`wrote ${filePath}`)
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
