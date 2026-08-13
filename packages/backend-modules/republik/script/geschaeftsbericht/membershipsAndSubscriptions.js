#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const {
  DEFAULT_AS_OF,
  endOfDayInZurich,
  fiscalYearLabelFromAsOf,
} = require('./lib/dates')
const { CATEGORIZED_CTE } = require('./lib/membershipCategorizedCte')
const {
  MITGLIEDSCHAFTEN_CATEGORIES,
  ABONNEMENTE_CATEGORIES,
} = require('./lib/membershipCategories')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('asOf', {
    describe:
      'point-in-time snapshot date, e.g. 2026-06-30 — interpreted as end-of-day Europe/Zurich',
    coerce: endOfDayInZurich,
    default: endOfDayInZurich(DEFAULT_AS_OF),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// DISTINCT id guards against the (should-be-rare) case of overlapping
// periods for the same membership both covering asOf.
const QUERY =
  CATEGORIZED_CTE +
  `
SELECT category, COUNT(DISTINCT id)::int AS count
FROM categorized
GROUP BY category
ORDER BY category
`

const fetchCounts = async (pgdb, asOf) => {
  const result = await pgdb.query(QUERY, [asOf, EXCLUDED_USER_IDS])
  const counts = {}
  result.forEach((row) => {
    counts[row.category] = row.count
  })
  return counts
}

// Breaks each category down by source system (old membershipTypes.name /
// new payments.subscription_type) — matches the exact structure of the
// original "Weitere Daten für Geschäftsbericht" source table (category →
// ABO row + YEARLY_SUB row → summed total), so a mismatch against that
// table can be traced to a specific system instead of only comparing
// already-combined totals.
const BREAKDOWN_QUERY =
  CATEGORIZED_CTE +
  `
SELECT category, source, type_name, COUNT(DISTINCT id)::int AS count
FROM categorized
GROUP BY category, source, type_name
ORDER BY category, source, type_name
`

const fetchBreakdown = async (pgdb, asOf) => {
  return pgdb.query(BREAKDOWN_QUERY, [asOf, EXCLUDED_USER_IDS])
}

// Splits new-system reduced YEARLY_SUBSCRIPTIONs by discount duration —
// 'once' (first-year-only, e.g. the YEARLY_REDUCED offer, labeled
// "Einstiegsangebot oder Kampagnen" in the output) vs. 'repeating'/'forever'
// (a permanent discount applied every renewal, e.g. the STUDENT offer's
// fixedDiscount — labeled "Reduzierte Mitgliedschaften", merged into one
// row since both mean "discounted for the life of the subscription").
// payments.invoices."discounts" stores Stripe's raw
// discount objects verbatim (invoiceCreated.ts: `discounts: invoice.discounts`),
// each with a nested coupon.duration — this has no equivalent on the old
// system (memberships.reducedPrice is a plain boolean with no duration
// concept), so this is reported separately rather than folded into the
// main categorized CTE.
const REDUCED_DURATION_QUERY = `
SELECT
  CASE disc.duration
    WHEN 'once' THEN 'Einstiegsangebot oder Kampagnen'
    WHEN 'repeating' THEN 'Reduzierte Mitgliedschaften'
    WHEN 'forever' THEN 'Reduzierte Mitgliedschaften'
    ELSE COALESCE(disc.duration, 'unknown')
  END AS discount_duration,
  COUNT(DISTINCT s.id)::int AS count
FROM payments.subscriptions s
JOIN payments.invoices i ON i."subscriptionId" = s.id
LEFT JOIN LATERAL (
  SELECT d->'coupon'->>'duration' AS duration
  FROM jsonb_array_elements(i.discounts) d
  LIMIT 1
) disc ON true
WHERE s.type = 'YEARLY_SUBSCRIPTION'
  AND i."periodStart" < $1 AND i."periodEnd" >= $1
  AND i."totalDiscountAmount" > 0
  AND s."userId" != ALL($2::uuid[])
  AND s.status NOT IN ('incomplete', 'incomplete_expired')
GROUP BY 1
ORDER BY 1
`

const fetchReducedDuration = async (pgdb, asOf) => {
  return pgdb.query(REDUCED_DURATION_QUERY, [asOf, EXCLUDED_USER_IDS])
}

const buildTable = (
  counts,
  lastYearCounts,
  categories,
  totalLabel,
  unredeemedCategory,
) => {
  const rows = categories.map((category) => ({
    category,
    count: counts[category] || 0,
    lastYear: lastYearCounts[category] || 0,
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const lastYearTotal = rows.reduce((sum, r) => sum + r.lastYear, 0)
  rows.push({ category: totalLabel, count: total, lastYear: lastYearTotal })
  // Unredeemed gift vouchers (memberships.voucherCode still set) are listed
  // separately, after the total, and deliberately excluded from it — see
  // README's "Gift-membership definition" section: the actual query behind
  // last year's report counted redeemed and unredeemed gifts as distinct
  // line items, not one combined point-in-time stock.
  if (unredeemedCategory) {
    rows.push({
      category: unredeemedCategory,
      count: counts[unredeemedCategory] || 0,
      lastYear: lastYearCounts[unredeemedCategory] || 0,
    })
  }
  return rows
}

const run = async () => {
  // argv.asOf is already the precise end-of-day-Zurich instant — pass it
  // (via .toDate()) straight to Postgres. Never re-derive a query parameter
  // by formatting it down to a bare 'YYYY-MM-DD' string and back — that
  // throws away the timezone and lets Postgres reinterpret it using its own
  // session timezone instead (see lib/dates.js for the ~22h bug this caused).
  const asOfInstant = argv.asOf
  const asOf = asOfInstant.format('YYYY-MM-DD') // display/output label only
  const fyLabel = fiscalYearLabelFromAsOf(argv.asOf)
  // Comparison column is always "the same query, one year earlier" — not a
  // hardcoded baseline — so this stays a real year-over-year comparison no
  // matter which --asOf is used in future years.
  const lastYearAsOfInstant = argv.asOf.subtract(1, 'year')
  const lastYearAsOf = lastYearAsOfInstant.format('YYYY-MM-DD') // label only
  console.log(
    `calculating membership/subscription snapshot as of ${asOf} 23:59:59 Europe/Zurich (compared against ${lastYearAsOf} 23:59:59 Europe/Zurich) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [counts, lastYearCounts, breakdown, reducedDuration] =
      await Promise.all([
        fetchCounts(pgdb, asOfInstant.toDate()),
        fetchCounts(pgdb, lastYearAsOfInstant.toDate()),
        fetchBreakdown(pgdb, asOfInstant.toDate()),
        fetchReducedDuration(pgdb, asOfInstant.toDate()),
      ])

    const unexpected = Object.keys(counts).filter((c) =>
      c.startsWith('Sonstige'),
    )
    if (unexpected.length) {
      console.warn(
        'WARNING: unexpected membership/subscription categories found — investigate before trusting totals:',
        unexpected.map((c) => `${c}: ${counts[c]}`),
      )
    }

    const mitgliedschaften = buildTable(
      counts,
      lastYearCounts,
      MITGLIEDSCHAFTEN_CATEGORIES,
      'Total Mitgliedschaften',
      'Mitgliedschaft als Geschenk, uneingelöst',
    )
    const abonnemente = buildTable(
      counts,
      lastYearCounts,
      ABONNEMENTE_CATEGORIES,
      'Total Abonnemente',
      'Monatsabonnement als Geschenk, uneingelöst',
    )

    console.log(`\nMitgliedschaften per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(mitgliedschaften)
    console.log(`\nAbonnemente per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(abonnemente)
    console.log(`\nBreakdown by source system per ${asOf}`)
    console.table(breakdown)
    console.log(
      `\nNew-system reduced YEARLY_SUBSCRIPTIONs by discount duration per ${asOf}`,
    )
    console.table(reducedDuration)

    writeCsv(mitgliedschaften, argv.out, `A-mitgliedschaften_FY${fyLabel}`)
    writeCsv(abonnemente, argv.out, `B-abonnemente_FY${fyLabel}`)
    writeCsv(breakdown, argv.out, `A-B-breakdown-by-source_FY${fyLabel}`)
    writeCsv(
      reducedDuration,
      argv.out,
      `A-reduced-by-discount-duration_FY${fyLabel}`,
    )
    writeJson(
      {
        asOf,
        lastYearAsOf,
        mitgliedschaften,
        abonnemente,
        breakdown,
        reducedDuration,
        rawCounts: counts,
        rawCountsLastYear: lastYearCounts,
      },
      argv.out,
      `A-B-mitgliedschaften-abonnemente_FY${fyLabel}`,
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
