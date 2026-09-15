import type { PgDb } from '@orbiting/backend-modules-types'

// Shared transaction/confirm-flag wiring for the one-off migrate-legacy-*
// scripts: dry-run by default (reports, then rolls back), `--confirm` to
// commit. Everything runs inside one transaction so a dry run can simply
// roll back, and a real run is all-or-nothing.
export const runOneOffMigration = async (
  label: string,
  migrate: (pgdb: PgDb) => Promise<void>,
): Promise<void> => {
  require('@orbiting/backend-modules-env').config()
  /* eslint-disable @typescript-eslint/no-var-requires */
  const PgDbConnector = require('@orbiting/backend-modules-base/lib/PgDb')
  /* eslint-enable @typescript-eslint/no-var-requires */

  const confirmed = process.argv.includes('--confirm')
  if (!confirmed) {
    console.log(
      'DRY RUN: reporting what would change, then rolling back. Pass --confirm to commit.',
    )
  }

  const pgdb = await PgDbConnector.connect({
    applicationName: `backends sanity ${label}`,
  })

  try {
    const tx = await pgdb.transactionBegin()
    try {
      await migrate(tx)

      if (confirmed) {
        await tx.transactionCommit()
        console.log('committed')
      } else {
        await tx.transactionRollback()
        console.log('rolled back (dry run)')
      }
    } catch (error) {
      await tx.transactionRollback()
      throw error
    }
  } finally {
    await PgDbConnector.disconnect(pgdb)
  }
}
