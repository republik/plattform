/**
 * Retries the Stripe / Mailchimp deletions that failed during a deleteUsers.js
 * run. The users' DB rows are already gone, so deleteUsers.js cannot do it.
 *
 * Input: the log (stdout) of a deleteUsers.js run on STDIN, one JSON object
 * per line. Only `external_failure` events of kind `stripe` and `mailchimp`
 * are used, all other lines (including non-JSON lines) are ignored. Several
 * logs can be concatenated.
 *
 * This script never writes to the database and NEVER SENDS MAILS. Users whose
 * confirmation mail is still outstanding are listed as
 * `confirmation_mail_pending` events at the end.
 *
 * DRY RUN IS THE DEFAULT: it only lists what would be retried. Pass
 * --no-dry-run to actually call Stripe and Mailchimp. --no-dry-run is refused
 * for non-local DATABASE_URL hosts unless --allow-remote is passed as well.
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
    .filter((r) => r && r.event === 'external_failure')

async function main() {
  if (!dryRun && !isLocalDatabase() && !argv['allow-remote']) {
    emit('error', {
      message:
        'refusing to --no-dry-run against a non-local DATABASE_URL without --allow-remote',
    })
    return 2
  }

  const events = parseEvents(readStdin())
  const pendingMails = events.filter((r) => r.kind === 'confirmation_mail')
  const seen = new Set()
  const failures = events
    .filter((r) => ['stripe', 'mailchimp'].includes(r.kind))
    .filter((r) => {
      const key = `${r.kind}:${r.customerId || r.email}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  emit('start', {
    mode: 'retry-external',
    dryRun,
    dbHost: getDbHost(),
    failures: failures.length,
  })

  // the database is only needed to find the Stripe accounts
  const needsStripe = !dryRun && failures.some((f) => f.kind === 'stripe')
  const pgdb = needsStripe ? await PgDb.connect() : null
  const { accounts = [] } = needsStripe ? await getStripeClients(pgdb) : {}

  let stillFailing = 0
  for (const f of failures) {
    const ctx = { userId: f.userId }
    if (dryRun) {
      emit('would_retry', { kind: f.kind, userId: f.userId })
      continue
    }
    const ok =
      f.kind === 'stripe'
        ? await deleteStripeCustomer(
            accounts,
            { id: f.customerId, companyId: f.companyId },
            ctx,
          )
        : await deleteFromMailchimp(f.email, ctx)
    if (!ok) stillFailing++
    emit('retried', { kind: f.kind, userId: f.userId, ok })
  }

  for (const m of pendingMails) {
    emit('confirmation_mail_pending', {
      userId: m.userId,
      email: m.email,
      reason: m.error,
    })
  }
  emit('summary', {
    retried: failures.length,
    stillFailing,
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
