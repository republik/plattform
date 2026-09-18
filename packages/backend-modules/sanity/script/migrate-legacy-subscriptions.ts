#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for proactively normalizing
// subscriptions that still key on a legacy publikator repoId, once that
// content has migrated to Sanity — ahead of eventually retiring the
// Elasticsearch-backed resolution path entirely.
//
// Not required for publish notifications to reach these subscribers today:
// resolveNotificationRecipients (lib/article.ts) already matches on both the
// legacy repoId and its Sanity ref. This script exists to actually
// normalize the stored rows for that eventual ES retirement.
//
// Dry-run by default: it reports every change it would make, rolling back
// each repoId's own scoped transaction as it goes (see runOneOffMigration.ts
// -- each repoId's write gets its own short-lived transaction rather than
// the whole run sharing one, so a long run doesn't hold locks on rows it
// already finished writing to). Pass --confirm to actually commit.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-subscriptions
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-subscriptions --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { fetchDocumentByLegacyRepoId, toSanityRef, isSanityRef } from '../lib/document'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'

const migrateSubscriptions = async (pgdb: PgDb, confirmed: boolean) => {
  const rows = await pgdb.public.subscriptions.find({
    objectType: 'Document',
  })
  const legacyRepoIds = [
    ...new Set(
      rows
        .map((row: any) => row.objectDocumentId)
        .filter((id: string) => id && !isSanityRef(id)),
    ),
  ] as string[]

  console.log(`subscriptions: ${legacyRepoIds.length} distinct legacy repoIds`)

  for (const repoId of legacyRepoIds) {
    const doc = await fetchDocumentByLegacyRepoId(repoId)
    if (!doc) continue

    const sanityRef = toSanityRef(doc._id)
    await runInScopedTransaction(pgdb, confirmed, (tx) =>
      tx.public.subscriptions.update(
        { objectType: 'Document', objectDocumentId: repoId },
        { objectDocumentId: sanityRef },
      ),
    )
    console.log(`subscriptions: ${repoId} -> ${sanityRef}`)
  }
}

runOneOffMigration('migrate-legacy-subscriptions', migrateSubscriptions)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
