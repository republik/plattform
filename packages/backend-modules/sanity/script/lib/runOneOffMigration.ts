import type { PgDb } from '@orbiting/backend-modules-types'

// Shared connect/confirm-flag wiring for the one-off migrate-legacy-*
// scripts: dry-run by default, `--confirm` to actually commit.
//
// `migrate` gets a live, non-transactional pgdb connection -- not one big
// transaction spanning the whole run. An earlier version opened a single
// transaction around the entire migration; that held a row lock on every
// row it touched for the full duration of the run (not just the moment it
// wrote to that row), which blocked any concurrent application write to a
// row the migration had already touched -- on a table written on
// essentially every article view, that's a real problem, and it applied
// even to a dry run, which still holds every lock until its one rollback at
// the very end.
//
// `migrate` is expected to wrap each unit of work (one repoId, one batch --
// whatever the migration's natural grain is) in its own short-lived
// transaction via runInScopedTransaction below, so locks are released
// immediately after each one instead of accumulating for the whole run.
export const runOneOffMigration = async (
  label: string,
  migrate: (pgdb: PgDb, confirmed: boolean) => Promise<void>,
): Promise<void> => {
  require('@orbiting/backend-modules-env').config()
  /* eslint-disable @typescript-eslint/no-var-requires */
  const PgDbConnector = require('@orbiting/backend-modules-base/lib/PgDb')
  /* eslint-enable @typescript-eslint/no-var-requires */

  const confirmed = process.argv.includes('--confirm')
  if (!confirmed) {
    console.log(
      'DRY RUN: reporting what would change, rolling back each unit of work as it goes. Pass --confirm to commit.',
    )
  }

  const pgdb = await PgDbConnector.connect({
    applicationName: `backends sanity ${label}`,
  })

  try {
    await migrate(pgdb, confirmed)
    console.log(confirmed ? 'committed' : 'dry run complete')
  } finally {
    await PgDbConnector.disconnect(pgdb)
  }
}

// Runs `work` in its own transaction, released immediately after --
// committed if `confirmed`, rolled back otherwise. Call this once per unit
// of work (e.g. once per repoId) rather than wrapping an entire multi-item
// migration in one transaction, so the migration never holds locks on rows
// it isn't actively writing to at that exact moment.
export const runInScopedTransaction = async <T>(
  pgdb: PgDb,
  confirmed: boolean,
  work: (tx: PgDb) => Promise<T>,
): Promise<T> => {
  const tx = await pgdb.transactionBegin()
  try {
    const result = await work(tx)
    if (confirmed) {
      await tx.transactionCommit()
    } else {
      await tx.transactionRollback()
    }
    return result
  } catch (error) {
    await tx.transactionRollback()
    throw error
  }
}
