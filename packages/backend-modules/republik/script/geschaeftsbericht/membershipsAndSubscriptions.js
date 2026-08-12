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

// Last year's (30.06.2025) known figures, printed alongside this year's
// output as a sanity-check baseline. Update/remove in future runs.
const LAST_YEAR = {
  Jahresmitgliedschaft: 17505,
  'Jahresmitgliedschaft, reduziert': 6816,
  Gönnermitgliedschaft: 136,
  'Mitgliedschaft als Geschenk': 655,
  'Total Mitgliedschaften': 25112,
  Monatsabonnement: 3225,
  'Monatsabonnement als Geschenk': 146,
  'Jahresabo (Mitgliederkampagne)': 185,
  'Total Abonnemente': 3556,
}

// Adapts the snapshot pattern from the `cockpit_membership_evolution`
// materialized view (republik/migrations/sqls/20250604102839-cockpit-materialized-view-up.sql):
// a membership/subscription counts as active on :asOf if its earliest period
// began before :asOf and its latest period ends on/after :asOf. Unions the
// legacy pledge-based `memberships` tables with the new Stripe-based
// `payments.subscriptions` tables and classifies both into the same
// German report categories.
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
    END AS category,
    "beginDate", "endDate"
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
    END AS category,
    "beginDate", "endDate"
  FROM new_rows
),
minmax AS (
  SELECT id, "userId", category,
         min("beginDate") AS "minBeginDate",
         max("endDate") AS "maxEndDate"
  FROM categorized
  GROUP BY id, "userId", category
)
SELECT category, COUNT(*)::int AS count
FROM minmax
WHERE "maxEndDate" >= $1 AND "minBeginDate" < $1
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

const buildTable = (counts, categories, totalLabel) => {
  const rows = categories.map((category) => ({
    category,
    count: counts[category] || 0,
    lastYear: LAST_YEAR[category] ?? '',
  }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  rows.push({
    category: totalLabel,
    count: total,
    lastYear: LAST_YEAR[totalLabel] ?? '',
  })
  return rows
}

const run = async () => {
  const asOf = argv.asOf.format('YYYY-MM-DD')
  console.log(`calculating membership/subscription snapshot as of ${asOf} …`)

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const result = await pgdb.query(QUERY, [asOf])
    const counts = {}
    result.forEach((row) => {
      counts[row.category] = row.count
    })

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
      MITGLIEDSCHAFTEN_CATEGORIES,
      'Total Mitgliedschaften',
    )
    const abonnemente = buildTable(
      counts,
      ABONNEMENTE_CATEGORIES,
      'Total Abonnemente',
    )

    console.log('\nMitgliedschaften per', asOf)
    console.table(mitgliedschaften)
    console.log('\nAbonnemente per', asOf)
    console.table(abonnemente)

    writeCsv(mitgliedschaften, argv.out, 'A-mitgliedschaften')
    writeCsv(abonnemente, argv.out, 'B-abonnemente')
    writeJson(
      { asOf, mitgliedschaften, abonnemente, rawCounts: counts },
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
