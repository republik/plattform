#!/usr/bin/env node
/**
 * Retries the Stripe / Mailchimp / portrait deletions that failed during a
 * deleteUsers.js run, or that never ran because the process died right after
 * the database commit. The users' DB rows are already gone, so deleteUsers.js
 * cannot do it.
 *
 * Input: the log (stdout) of a deleteUsers.js run on STDIN, one JSON object
 * per line; several logs can be concatenated, other lines are ignored. Used:
 *   - `external_failure` events of kind stripe, mailchimp, portrait
 *   - `pending_external` events of users without a `user_done` event (the run
 *     was interrupted). For those the database is checked first: only users
 *     that are really deleted or anonymised are processed, a user that still
 *     exists untouched (commit never happened) is skipped.
 *
 * Safety checks before a retry deletes anything:
 *   - Mailchimp: skipped if a live user with that e-mail exists again (the
 *     person may have registered anew since).
 *   - Portrait: skipped if another user uses the same file now.
 *
 * This script never writes to the database and NEVER SENDS MAILS. Users whose
 * confirmation mail is still outstanding are listed as
 * `confirmation_mail_pending` events at the end.
 *
 * DRY RUN IS THE DEFAULT: it only lists what would be retried. Pass
 * --no-dry-run to actually call Stripe, Mailchimp and S3. --no-dry-run is
 * refused for non-local DATABASE_URL hosts unless --allow-remote is passed.
 *
 * Usage:
 *   cat run.log | node script/gdpr/retryExternalDeletions.js
 *   cat run.log | node script/gdpr/retryExternalDeletions.js --no-dry-run > retry-1.log
 *
 * Output is NDJSON like deleteUsers.js. Store it: a failure that happens again
 * is logged as `external_failure` and can be retried with this log again.
 */
require('@orbiting/backend-modules-env').config()
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const {
  emit,
  readStdin,
  isLocalDatabase,
  getDbHost,
  getStripeClients,
  deleteStripeCustomer,
  deleteFromMailchimp,
  deletePortrait,
  isPortraitShared,
} = require('./deleteUsers.lib')

const argv = yargs(hideBin(process.argv))
  .option('dry-run', {
    description: 'Only list what would be retried, disable with --no-dry-run',
    type: 'boolean',
    default: true,
  })
  .option('allow-remote', {
    description: 'Allow --no-dry-run against a non-local database',
    type: 'boolean',
    default: false,
  })
  .parseSync()

const dryRun = argv['dry-run']

const parseEvents = (input) =>
  input
    .split('\n')
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch (e) {
        return null
      }
    })
    .filter(Boolean)

// failures of the form { kind, userId, ... } to retry, deduplicated
const taskKey = (t) => `${t.kind}:${t.customerId || t.email || t.portraitUrl}`

// Users of interrupted runs: a pending_external without user_done. Only the
// database knows whether the commit happened.
const findInterruptedUsers = async (events, pgdb) => {
  const done = new Set(
    events.filter((e) => e.event === 'user_done').map((e) => e.userId),
  )
  const pending = events.filter(
    (e) => e.event === 'pending_external' && !done.has(e.userId),
  )
  if (!pending.length) {
    return { committed: [], notCommitted: [] }
  }
  const rows = await pgdb.query(
    `SELECT id, "deletedAt" FROM users WHERE id = ANY(:ids)`,
    { ids: [...new Set(pending.map((p) => p.userId))] },
  )
  const byId = new Map(rows.map((r) => [r.id, r]))
  const committed = []
  const notCommitted = []
  for (const p of pending) {
    const row = byId.get(p.userId)
    // gone (deleted) or marked deleted (anonymised) = the commit happened
    if (!row || row.deletedAt) committed.push(p)
    else notCommitted.push(p)
  }
  return { committed, notCommitted }
}

const tasksFromPending = (p) => [
  ...(p.stripeCustomers || []).map((c) => ({
    kind: 'stripe',
    userId: p.userId,
    customerId: c.id,
    companyId: c.companyId,
  })),
  ...(p.email ? [{ kind: 'mailchimp', userId: p.userId, email: p.email }] : []),
  ...(p.portraitUrl
    ? [{ kind: 'portrait', userId: p.userId, portraitUrl: p.portraitUrl }]
    : []),
]

async function main() {
  if (!dryRun && !isLocalDatabase() && !argv['allow-remote']) {
    emit('error', {
      message:
        'refusing to --no-dry-run against a non-local DATABASE_URL without --allow-remote',
    })
    return 2
  }

  const events = parseEvents(readStdin())
  const failures = events.filter((e) => e.event === 'external_failure')
  const pendingMails = failures.filter((r) => r.kind === 'confirmation_mail')
  const retryable = failures.filter((r) =>
    ['stripe', 'mailchimp', 'portrait'].includes(r.kind),
  )
  const hasInterrupted = events.some((e) => e.event === 'pending_external')

  // The database is needed to find the Stripe accounts and for the safety
  // checks, all read only.
  const needsDb = hasInterrupted || retryable.length > 0
  const pgdb = needsDb ? await PgDb.connect() : null

  const { committed, notCommitted } = hasInterrupted
    ? await findInterruptedUsers(events, pgdb)
    : { committed: [], notCommitted: [] }
  notCommitted.forEach((p) =>
    emit('skipped_not_deleted', {
      userId: p.userId,
      message:
        'the run was interrupted and this user still exists untouched, nothing to clean up outside the database',
    }),
  )

  const seen = new Set()
  const tasks = [...retryable, ...committed.flatMap(tasksFromPending)].filter(
    (t) => {
      const key = taskKey(t)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    },
  )
  // interrupted users did not get their confirmation mail either
  committed.forEach((p) =>
    pendingMails.push({
      userId: p.userId,
      email: p.email,
      error: 'run interrupted after the commit',
    }),
  )

  emit('start', {
    mode: 'retry-external',
    dryRun,
    dbHost: getDbHost(),
    failures: retryable.length,
    interruptedUsers: committed.length,
    tasks: tasks.length,
  })

  const needsStripe = !dryRun && tasks.some((t) => t.kind === 'stripe')
  const { accounts = [] } = needsStripe ? await getStripeClients(pgdb) : {}

  let stillFailing = 0
  let skipped = 0
  for (const t of tasks) {
    const ctx = { userId: t.userId }

    // do not touch data that may belong to someone else now (read only checks,
    // also in a dry run so it shows what a real run would do)
    let skipReason = null
    if (t.kind === 'mailchimp') {
      const { count } = await pgdb.queryOne(
        `SELECT count(*)::int AS count FROM users
         WHERE email = :email AND "deletedAt" IS NULL`,
        { email: t.email },
      )
      if (count > 0) {
        skipReason =
          'a live user with this e-mail exists again, not removing it from Mailchimp'
      }
    }
    if (
      t.kind === 'portrait' &&
      (await isPortraitShared(pgdb, t.portraitUrl))
    ) {
      skipReason = 'another user uses this portrait file now, not deleting it'
    }
    if (skipReason) {
      skipped++
      emit('retry_skipped', { kind: t.kind, ...ctx, message: skipReason })
      continue
    }
    if (dryRun) {
      emit('would_retry', { kind: t.kind, userId: t.userId })
      continue
    }

    let ok
    if (t.kind === 'stripe') {
      ok = await deleteStripeCustomer(
        accounts,
        { id: t.customerId, companyId: t.companyId },
        ctx,
      )
    } else if (t.kind === 'portrait') {
      ok = await deletePortrait(t.portraitUrl, ctx)
    } else {
      ok = await deleteFromMailchimp(t.email, ctx)
    }
    if (!ok) stillFailing++
    emit('retried', { kind: t.kind, userId: t.userId, ok })
  }

  for (const m of pendingMails) {
    emit('confirmation_mail_pending', {
      userId: m.userId,
      email: m.email,
      reason: m.error,
    })
  }
  emit('summary', {
    retried: tasks.length - skipped,
    skipped,
    stillFailing,
    interruptedUsers: committed.length,
    confirmationMailsPending: pendingMails.length,
    dryRun,
  })

  if (pgdb) await pgdb.close()
  return stillFailing ? 1 : 0
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    emit('error', { message: e.message, stack: e.stack })
    process.exit(1)
  })
