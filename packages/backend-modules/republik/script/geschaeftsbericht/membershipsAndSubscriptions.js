#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeCsv, writeJson } = require('./lib/output')
const { DEFAULT_AS_OF } = require('./lib/dates')

const argv = yargs
  .option('asOf', {
    describe: 'point-in-time snapshot date, e.g. 2026-06-30',
    coerce: dayjs,
    default: dayjs(DEFAULT_AS_OF),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// A membership/subscription counts as active on :asOf if it has a period
// (membershipPeriods row / invoice) that covers :asOf directly — not merely
// between the membership's earliest-ever and latest-ever period, since real
// gaps exist between periods (failed payment, later resubscribe) and
// aggregating across them would silently span those gaps. Unions the legacy
// pledge-based `memberships` tables with the new Stripe-based
// `payments.subscriptions` tables and classifies both into the same German
// report categories.
const QUERY = `
WITH old_rows AS (
  SELECT
    m.id::text AS id,
    m."userId",
    mt.name AS type_name,
    m."reducedPrice",
    -- A membership is a gift if either:
    --  1) it was bought via the dedicated ABO_GIVE package (always a gift,
    --     regardless of who currently holds it), or
    --  2) the pledge's payer differs from the person currently holding the
    --     membership (a regular ABO directly gifted to someone else) — same
    --     signal already used in RevenueStats/segments.js.
    -- (packages."group" was a one-time 2018 backfill, not reliably set for
    -- packages created in later campaigns — use packages."name" instead.)
    EXISTS (
      SELECT 1 FROM pledges p
      JOIN packages pkg ON pkg.id = p."packageId"
      WHERE p.id = m."pledgeId"
        AND (pkg."name" = 'ABO_GIVE' OR p."userId" != m."userId")
    ) AS is_gift,
    mp."beginDate",
    mp."endDate"
  FROM "memberships" m
  JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
  JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
  -- asOf must fall inside THIS SPECIFIC period, not just between the
  -- membership's earliest-ever and latest-ever period. Memberships can have
  -- real gaps between periods (failed payment, later resubscribe) — monthly
  -- memberships renew far more often than yearly ones, so gaps are far more
  -- common there; aggregating min/max across all periods silently spans
  -- those gaps and overcounts monthly memberships by ~11% in practice.
  WHERE mp."beginDate" < $1 AND mp."endDate" >= $1
),
new_rows AS (
  SELECT
    s.id::text AS id,
    s."userId",
    s.type::text AS type_name,
    -- best-effort: any positive invoice discount is treated as "reduced"
    EXISTS (
      SELECT 1 FROM payments.invoices di
      WHERE di."subscriptionId" = s.id
        AND di."totalDiscountAmount" > 0
        AND $1 BETWEEN di."periodStart" AND di."periodEnd"
    ) AS is_reduced,
    -- best-effort: gift voucher redeemed by this user within +/-14 days of
    -- subscription start (no FK exists between giftVouchers and subscriptions)
    EXISTS (
      SELECT 1 FROM payments."giftVouchers" gv
      WHERE gv."redeemedBy" = s."userId"
        AND gv."redeemedAt" BETWEEN s."currentPeriodStart" - interval '14 days'
                                 AND s."currentPeriodStart" + interval '14 days'
    ) AS is_gift,
    i."periodStart" AS "beginDate",
    i."periodEnd" AS "endDate"
  FROM payments.subscriptions s
  JOIN payments.invoices i ON i."subscriptionId" = s.id
  -- same reasoning as old_rows above: asOf must fall inside this specific
  -- invoice period, not spanning across all of a subscription's invoices.
  WHERE i."periodStart" < $1 AND i."periodEnd" >= $1
),
categorized AS (
  SELECT id, "userId",
    CASE
      WHEN type_name = 'ABO' AND is_gift THEN 'Mitgliedschaft als Geschenk'
      WHEN type_name = 'ABO' AND "reducedPrice" THEN 'Jahresmitgliedschaft, reduziert'
      WHEN type_name = 'ABO' THEN 'Jahresmitgliedschaft'
      WHEN type_name = 'BENEFACTOR_ABO' THEN 'Gönnermitgliedschaft'
      WHEN type_name = 'YEARLY_ABO' THEN 'Jahresabo (Mitgliederkampagne)'
      WHEN type_name = 'MONTHLY_ABO' THEN 'Monatsabonnement'
      WHEN type_name = 'ABO_GIVE_MONTHS' THEN 'Monatsabonnement als Geschenk'
      ELSE 'Sonstige (alt): ' || type_name
    END AS category
  FROM old_rows
  UNION ALL
  SELECT id, "userId",
    CASE
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_gift THEN 'Mitgliedschaft als Geschenk'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' AND is_reduced THEN 'Jahresmitgliedschaft, reduziert'
      WHEN type_name = 'YEARLY_SUBSCRIPTION' THEN 'Jahresmitgliedschaft'
      WHEN type_name = 'BENEFACTOR_SUBSCRIPTION' THEN 'Gönnermitgliedschaft'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' AND is_gift THEN 'Monatsabonnement als Geschenk'
      WHEN type_name = 'MONTHLY_SUBSCRIPTION' THEN 'Monatsabonnement'
      ELSE 'Sonstige (neu): ' || type_name
    END AS category
  FROM new_rows
)
-- DISTINCT id guards against the (should-be-rare) case of overlapping
-- periods for the same membership both covering asOf.
SELECT category, COUNT(DISTINCT id)::int AS count
FROM categorized
GROUP BY category
ORDER BY category
`

const MITGLIEDSCHAFTEN_CATEGORIES = [
  'Jahresmitgliedschaft',
  'Jahresmitgliedschaft, reduziert',
  'Gönnermitgliedschaft',
  'Mitgliedschaft als Geschenk',
]

const ABONNEMENTE_CATEGORIES = [
  'Monatsabonnement',
  'Monatsabonnement als Geschenk',
  'Jahresabo (Mitgliederkampagne)',
]

const fetchCounts = async (pgdb, asOf) => {
  const result = await pgdb.query(QUERY, [asOf])
  const counts = {}
  result.forEach((row) => {
    counts[row.category] = row.count
  })
  return counts
}

const buildTable = (counts, lastYearCounts, categories, totalLabel) => {
  const rows = categories.map((category) => ({
    category,
    count: counts[category] || 0,
    lastYear: lastYearCounts[category] || 0,
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const lastYearTotal = rows.reduce((sum, r) => sum + r.lastYear, 0)
  rows.push({ category: totalLabel, count: total, lastYear: lastYearTotal })
  return rows
}

const run = async () => {
  const asOf = argv.asOf.format('YYYY-MM-DD')
  // Comparison column is always "the same query, one year earlier" — not a
  // hardcoded baseline — so this stays a real year-over-year comparison no
  // matter which --asOf is used in future years.
  const lastYearAsOf = argv.asOf.subtract(1, 'year').format('YYYY-MM-DD')
  console.log(
    `calculating membership/subscription snapshot as of ${asOf} (compared against ${lastYearAsOf}) …`,
  )

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [counts, lastYearCounts] = await Promise.all([
      fetchCounts(pgdb, asOf),
      fetchCounts(pgdb, lastYearAsOf),
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
    )
    const abonnemente = buildTable(
      counts,
      lastYearCounts,
      ABONNEMENTE_CATEGORIES,
      'Total Abonnemente',
    )

    console.log(`\nMitgliedschaften per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(mitgliedschaften)
    console.log(`\nAbonnemente per ${asOf} (vs. ${lastYearAsOf})`)
    console.table(abonnemente)

    writeCsv(mitgliedschaften, argv.out, 'A-mitgliedschaften')
    writeCsv(abonnemente, argv.out, 'B-abonnemente')
    writeJson(
      {
        asOf,
        lastYearAsOf,
        mitgliedschaften,
        abonnemente,
        rawCounts: counts,
        rawCountsLastYear: lastYearCounts,
      },
      argv.out,
      'A-B-mitgliedschaften-abonnemente',
    )
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
