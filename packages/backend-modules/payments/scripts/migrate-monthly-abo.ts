/**
 * Migrates MONTHLY_ABO memberships that have a Stripe subscriptionId into
 * payments.subscriptions (+ subscriptionCancellations + invoices).
 *
 * Reuses the same UUID as the legacy membership row so analytics identity is preserved.
 * Fetches status / period data from Stripe as the source of truth.
 * Marks each migrated membership with migratedAt so old webhook handlers skip it.
 *
 * Usage:
 *   # Dry run (default)
 *   npx ts-node packages/backend-modules/payments/scripts/migrate-monthly-abo.ts \
 *     --database-url=... --stripe-api-key=...
 *
 *   # Small batch test
 *   npx ts-node packages/backend-modules/payments/scripts/migrate-monthly-abo.ts \
 *     --database-url=... --stripe-api-key=... --no-dry-run --limit=10
 *
 *   # Full run
 *   npx ts-node packages/backend-modules/payments/scripts/migrate-monthly-abo.ts \
 *     --database-url=... --stripe-api-key=... --no-dry-run
 *
 *   # Rollback everything
 *   npx ts-node packages/backend-modules/payments/scripts/migrate-monthly-abo.ts \
 *     --database-url=... --rollback
 */

import { PgDb } from 'pogi'
import Stripe from 'stripe'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = yargs(hideBin(process.argv))
  .option('database-url', {
    type: 'string',
    demandOption: true,
    description: 'PostgreSQL connection string',
  })
  .option('stripe-api-key', {
    type: 'string',
    description: 'REPUBLIK Stripe secret key (required unless --rollback)',
  })
  .option('dry-run', {
    type: 'boolean',
    default: true,
    description: 'Log what would happen, write nothing',
  })
  .option('verbose', {
    type: 'boolean',
    default: false,
    description: 'Log every row including skips',
  })
  .option('limit', {
    type: 'number',
    description: 'Process at most N memberships',
  })
  .option('rollback', {
    type: 'boolean',
    default: false,
    description: 'Delete all previously migrated rows and exit',
  })
  .parseSync()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LegacyMembership = {
  id: string
  userId: string
  sequenceNumber: number
  subscriptionId: string
  active: boolean
  renew: boolean
  latestPaymentFailedAt: Date | null
  createdAt: Date
  updatedAt: Date
  latest_period: {
    beginDate: string
    endDate: string
  } | null
  cancellation: {
    id: string
    category: string
    reason: string | null
    createdAt: string
    updatedAt: string
  } | null
}

type Counters = {
  migrated: number
  skippedAlreadyMigrated: number
  skippedNoSubscriptionId: number
  errors: number
}

// ---------------------------------------------------------------------------
// Category mapping
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<
  string,
  { category: string; suppressConfirmation: boolean; suppressWinback: boolean }
> = {
  EDITORIAL: {
    category: 'editorial',
    suppressConfirmation: false,
    suppressWinback: false,
  },
  NO_TIME: {
    category: 'no_time',
    suppressConfirmation: false,
    suppressWinback: false,
  },
  TOO_EXPENSIVE: {
    category: 'too_expensive',
    suppressConfirmation: false,
    suppressWinback: false,
  },
  OTHER: {
    category: 'other',
    suppressConfirmation: false,
    suppressWinback: false,
  },
  VOID: {
    category: 'void',
    suppressConfirmation: true,
    suppressWinback: true,
  },
  SYSTEM: {
    category: 'system',
    suppressConfirmation: true,
    suppressWinback: true,
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseStripeDate(value: number | null | undefined): Date | null {
  if (typeof value === 'number') return new Date(value * 1000)
  return null
}

function deriveStatusFromLegacy(m: LegacyMembership): {
  status: string
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  endedAt: Date | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
} {
  let status: string
  let cancelAtPeriodEnd: boolean

  if (m.active && !m.latestPaymentFailedAt && m.renew) {
    status = 'active'
    cancelAtPeriodEnd = false
  } else if (m.active && !m.latestPaymentFailedAt && !m.renew) {
    status = 'active'
    cancelAtPeriodEnd = true
  } else if (m.active && m.latestPaymentFailedAt) {
    status = 'past_due'
    cancelAtPeriodEnd = !m.renew
  } else {
    status = 'canceled'
    cancelAtPeriodEnd = false
  }

  const canceledAt =
    status === 'canceled'
      ? m.cancellation
        ? new Date(m.cancellation.createdAt)
        : m.updatedAt
      : null

  const endedAt =
    status === 'canceled' && m.latest_period
      ? new Date(m.latest_period.endDate)
      : null

  return {
    status,
    cancelAtPeriodEnd,
    canceledAt,
    endedAt,
    currentPeriodStart: m.latest_period
      ? new Date(m.latest_period.beginDate)
      : null,
    currentPeriodEnd: m.latest_period
      ? new Date(m.latest_period.endDate)
      : null,
  }
}

// ---------------------------------------------------------------------------
// Source query
// ---------------------------------------------------------------------------

const SOURCE_QUERY = `
  SELECT
    m.id,
    m."userId",
    m."sequenceNumber",
    m."subscriptionId",
    m.active,
    m.renew,
    m."autoPay",
    m."latestPaymentFailedAt",
    m."cancelReasons",
    m."createdAt",
    m."updatedAt",
    (SELECT row_to_json(mp) FROM "membershipPeriods" mp
     WHERE mp."membershipId" = m.id
     ORDER BY mp."endDate" DESC LIMIT 1) AS latest_period,
    (SELECT row_to_json(mc) FROM "membershipCancellations" mc
     WHERE mc."membershipId" = m.id AND mc."revokedAt" IS NULL
     ORDER BY mc."createdAt" DESC LIMIT 1) AS cancellation
  FROM memberships m
  JOIN "membershipTypes" mt ON m."membershipTypeId" = mt.id
  JOIN packages pkg ON mt."packageId" = pkg.id
  WHERE pkg.name = 'MONTHLY_ABO'
    AND m."subscriptionId" IS NOT NULL
  ORDER BY m."createdAt" ASC
`

// ---------------------------------------------------------------------------
// Rollback
// ---------------------------------------------------------------------------

async function rollback(pgdb: PgDb): Promise<void> {
  console.log('=== ROLLBACK MODE ===')

  const migrated: { id: string }[] = await pgdb.query(`
    SELECT id FROM payments.subscriptions
    WHERE (metadata->>'legacyMembershipId') IS NOT NULL
      AND type = 'MONTHLY_SUBSCRIPTION'
  `)

  if (migrated.length === 0) {
    console.log('Nothing to roll back.')
    return
  }

  const ids = migrated.map((r) => r.id)
  console.log(`Rolling back ${ids.length} migrated subscriptions...`)

  if (argv['dry-run']) {
    console.log('DRY RUN — no changes written.')
    return
  }

  const tx = await pgdb.transactionBegin()
  try {
    // 1. Clear migratedAt first so memberships are never stamped without a payments row
    await tx.query(
      `UPDATE memberships SET "migratedAt" = NULL WHERE id = ANY(:ids)`,
      { ids },
    )
    // 2. Delete invoices
    await tx.query(
      `DELETE FROM payments.invoices WHERE "subscriptionId" = ANY(:ids)`,
      { ids },
    )
    // 3. Delete cancellations
    await tx.query(
      `DELETE FROM payments."subscriptionCancellations" WHERE "subscriptionId" = ANY(:ids)`,
      { ids },
    )
    // 4. Delete subscriptions
    await tx.query(
      `DELETE FROM payments.subscriptions WHERE id = ANY(:ids)`,
      { ids },
    )
    await tx.transactionCommit()
    console.log(`Rolled back ${ids.length} subscriptions.`)
  } catch (e) {
    await tx.transactionRollback()
    console.error('Rollback failed, transaction rolled back:', e)
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Process a single membership
// ---------------------------------------------------------------------------

async function processMembership(
  membership: LegacyMembership,
  pgdb: PgDb,
  stripe: Stripe,
  counters: Counters,
): Promise<void> {
  const label = `sub=${membership.subscriptionId} membership=${membership.id}`

  // Idempotency check
  const existing = await pgdb.queryOne(
    `SELECT id FROM payments.subscriptions WHERE id = :id`,
    { id: membership.id },
  )
  if (existing) {
    if (argv.verbose) {
      console.log(`SKIP: ${label} reason=already_migrated`)
    }
    counters.skippedAlreadyMigrated++
    return
  }

  // --- Fetch all Stripe data BEFORE opening the transaction ---

  const stripeSub = await stripe.subscriptions
    .retrieve(membership.subscriptionId)
    .catch(() => null)

  let status: string
  let cancelAtPeriodEnd: boolean
  let canceledAt: Date | null
  let cancelAt: Date | null
  let endedAt: Date | null
  let currentPeriodStart: Date | null
  let currentPeriodEnd: Date | null

  if (stripeSub) {
    status = stripeSub.status
    cancelAtPeriodEnd = stripeSub.cancel_at_period_end
    canceledAt = parseStripeDate(stripeSub.canceled_at)
    cancelAt = parseStripeDate(stripeSub.cancel_at)
    endedAt = parseStripeDate(stripeSub.ended_at)
    currentPeriodStart = parseStripeDate(stripeSub.current_period_start)
    currentPeriodEnd = parseStripeDate(stripeSub.current_period_end)
  } else {
    console.log(
      `WARN: ${label} reason=stripe_subscription_not_found (treating as canceled)`,
    )
    const derived = deriveStatusFromLegacy(membership)
    status = 'canceled'
    cancelAtPeriodEnd = false
    canceledAt = derived.canceledAt
    cancelAt = null
    endedAt = derived.endedAt
    currentPeriodStart = derived.currentPeriodStart
    currentPeriodEnd = derived.currentPeriodEnd
  }

  if (!membership.latest_period) {
    console.log(`WARN: ${label} reason=no_period_rows (inserting with nulls)`)
  }

  // Collect invoices before opening transaction
  const stripeInvoices: Stripe.Invoice[] = []
  if (stripeSub) {
    for await (const inv of stripe.invoices.list({
      subscription: membership.subscriptionId,
      limit: 100,
    })) {
      stripeInvoices.push(inv)
    }
  }

  if (argv['dry-run']) {
    console.log(
      `MIGRATED (dry run): ${label} status=${status} invoices=${stripeInvoices.length}`,
    )
    counters.migrated++
    return
  }

  // --- Transaction ---

  const tx = await pgdb.transactionBegin()
  try {
    // Insert subscription (reuse membership UUID)
    await tx.query(
      `INSERT INTO payments.subscriptions (
        "id", "userId", "company", "provider", "externalId", "type", "status",
        "metadata", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd",
        "cancelAt", "canceledAt", "endedAt", "createdAt", "updatedAt"
      ) VALUES (
        :id, :userId, 'REPUBLIK', 'STRIPE', :externalId, 'MONTHLY_SUBSCRIPTION', :status,
        :metadata, :currentPeriodStart, :currentPeriodEnd, :cancelAtPeriodEnd,
        :cancelAt, :canceledAt, :endedAt, :createdAt, now()
      )`,
      {
        id: membership.id,
        userId: membership.userId,
        externalId: membership.subscriptionId,
        status,
        metadata: JSON.stringify({
          legacyMembershipId: membership.id,
          legacySequenceNumber: membership.sequenceNumber,
        }),
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        cancelAt,
        canceledAt,
        endedAt,
        createdAt: membership.createdAt,
      },
    )

    // Insert cancellation if present
    if (membership.cancellation) {
      const cat = CATEGORY_MAP[membership.cancellation.category] ?? {
        category: 'other',
        suppressConfirmation: false,
        suppressWinback: false,
      }
      await tx.query(
        `INSERT INTO payments."subscriptionCancellations" (
          "subscriptionId", "category", "reason",
          "suppressConfirmation", "suppressWinback", "cancelledViaSupport",
          "createdAt", "updatedAt"
        ) VALUES (
          :subscriptionId, :category, :reason,
          :suppressConfirmation, :suppressWinback, false,
          :createdAt, now()
        )`,
        {
          subscriptionId: membership.id,
          category: cat.category,
          reason: membership.cancellation.reason,
          suppressConfirmation: cat.suppressConfirmation,
          suppressWinback: cat.suppressWinback,
          createdAt: new Date(membership.cancellation.createdAt),
        },
      )
    }

    // Insert invoices
    for (const inv of stripeInvoices) {
      const alreadyExists = await tx.queryOne(
        `SELECT id FROM payments.invoices WHERE "externalId" = :externalId`,
        { externalId: inv.id },
      )
      if (alreadyExists) continue

      const lineItem = inv.lines.data[0]
      const periodStart = lineItem?.period?.start
        ? parseStripeDate(lineItem.period.start)
        : null
      const periodEnd = lineItem?.period?.end
        ? parseStripeDate(lineItem.period.end)
        : null

      await tx.query(
        `INSERT INTO payments.invoices (
          "userId", "subscriptionId", "company", "provider", "externalId",
          "total", "totalBeforeDiscount", "totalDiscountAmount", "totalDiscountAmounts",
          "totalExcludingTax", "totalTaxAmount", "totalTaxAmounts",
          "status", "items", "discounts", "metadata",
          "periodStart", "periodEnd", "createdAt", "updatedAt"
        ) VALUES (
          :userId, :subscriptionId, 'REPUBLIK', 'STRIPE', :externalId,
          :total, :totalBeforeDiscount, :totalDiscountAmount, :totalDiscountAmounts,
          :totalExcludingTax, :totalTaxAmount, :totalTaxAmounts,
          :status, :items, :discounts, :metadata,
          :periodStart, :periodEnd, :createdAt, now()
        )`,
        {
          userId: membership.userId,
          subscriptionId: membership.id,
          externalId: inv.id,
          total: inv.total,
          totalBeforeDiscount: inv.subtotal,
          totalDiscountAmount:
            inv.total_discount_amounts?.reduce(
              (acc, d) => acc + d.amount,
              0,
            ) ?? 0,
          totalDiscountAmounts: JSON.stringify(
            inv.total_discount_amounts ?? [],
          ),
          totalExcludingTax: inv.total_excluding_tax ?? inv.total,
          totalTaxAmount:
            (inv as any).total_taxes?.reduce(
              (acc: number, t: any) => acc + t.amount,
              0,
            ) ?? 0,
          totalTaxAmounts: JSON.stringify((inv as any).total_taxes ?? []),
          status: inv.status,
          items: JSON.stringify(inv.lines.data),
          discounts: JSON.stringify(inv.discounts ?? []),
          metadata: JSON.stringify({ legacyMembershipId: membership.id }),
          periodStart,
          periodEnd,
          createdAt: new Date(inv.created * 1000),
        },
      )
    }

    // Mark membership as migrated
    await tx.query(
      `UPDATE memberships SET "migratedAt" = now() WHERE id = :id`,
      { id: membership.id },
    )

    await tx.transactionCommit()

    console.log(
      `MIGRATED: ${label} status=${status} invoices=${stripeInvoices.length}`,
    )
    counters.migrated++
  } catch (e) {
    await tx.transactionRollback()
    console.error(`ERROR: ${label}`, e)
    counters.errors++
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pgdb = await PgDb.connect({
    connectionString: argv['database-url'],
  })

  if (argv.rollback) {
    await rollback(pgdb)
    await pgdb.close()
    return
  }

  if (!argv['stripe-api-key']) {
    console.error('--stripe-api-key is required (unless --rollback)')
    process.exit(1)
  }

  const stripe = new Stripe(argv['stripe-api-key']!, {
    // @ts-expect-error stripe-version-2020-08-27
    apiVersion: '2020-08-27',
  })

  if (argv['dry-run']) {
    console.log('=== DRY RUN — no changes will be written ===')
  }

  const allMemberships: LegacyMembership[] = await pgdb.query(SOURCE_QUERY)

  // Log memberships without subscriptionId (not included in SOURCE_QUERY but shown for info)
  const noSubId: { id: string }[] = await pgdb.query(`
    SELECT m.id
    FROM memberships m
    JOIN "membershipTypes" mt ON m."membershipTypeId" = mt.id
    JOIN packages pkg ON mt."packageId" = pkg.id
    WHERE pkg.name = 'MONTHLY_ABO'
      AND m."subscriptionId" IS NULL
  `)
  if (noSubId.length > 0) {
    console.log(
      `WARN: ${noSubId.length} MONTHLY_ABO memberships have no subscriptionId — skipping (manual review needed)`,
    )
    noSubId.forEach((m) =>
      console.log(`  SKIP: membership/${m.id} reason=no_subscriptionId`),
    )
  }

  const toProcess = argv.limit
    ? allMemberships.slice(0, argv.limit)
    : allMemberships

  console.log(
    `Processing ${toProcess.length} of ${allMemberships.length} MONTHLY_ABO memberships...`,
  )

  const counters: Counters = {
    migrated: 0,
    skippedAlreadyMigrated: 0,
    skippedNoSubscriptionId: noSubId.length,
    errors: 0,
  }

  for (const membership of toProcess) {
    await processMembership(membership, pgdb, stripe, counters)
  }

  console.log('')
  console.log('--- Summary ---')
  console.log(`Migrated:                   ${counters.migrated}`)
  console.log(`Skipped (already migrated): ${counters.skippedAlreadyMigrated}`)
  console.log(
    `Skipped (no subscriptionId):${counters.skippedNoSubscriptionId}`,
  )
  console.log(`Errors:                     ${counters.errors}`)

  await pgdb.close()

  if (counters.errors > 0) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
