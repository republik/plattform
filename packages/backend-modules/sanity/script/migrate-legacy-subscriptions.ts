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
// This overwrites objectDocumentId in place rather than dual-writing (unlike
// migrate-legacy-collection-items.ts) -- the column holds a repoId or a
// sanity: ref interchangeably by design, and resolveNotificationRecipients
// already matches both forms, so nothing depends on the pre-migration value
// surviving on the row. Note this makes the write effectively irreversible
// in the simple sense: repoIdToSanityId is a one-way hash, so the original
// repoId string isn't recoverable from the row after this runs (it can
// still be reconstructed by hashing every repoId in publikator.repos and
// matching, since that table retains every legacy repoId, but that's a
// re-derivation, not an undo).
//
// The distinct-repoId read and the Sanity existence check are batched the
// same way as migrate-legacy-collection-items.ts (see
// script/lib/sanityExistence.ts) -- this table doesn't approach
// collectionDocumentItems' row count, but the same "load everything just to
// dedupe in JS" and "one Sanity API call per repoId" problems apply at
// whatever scale it does reach.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-subscriptions
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-subscriptions --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { legacySanityId, toSanityRef } from '../lib/document'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'
import { fetchExistingSanityDocsById } from './lib/sanityExistence'

const migrateSubscriptions = async (pgdb: PgDb, confirmed: boolean) => {
  const legacyRepoIds: string[] = await pgdb.queryOneColumn(`
    SELECT DISTINCT "objectDocumentId" FROM subscriptions
    WHERE "objectType" = 'Document'
      AND "objectDocumentId" IS NOT NULL
      AND "objectDocumentId" NOT LIKE 'sanity:%'
  `)

  console.log(`subscriptions: ${legacyRepoIds.length} distinct legacy repoIds`)

  const sanityIdByRepoId = new Map<string, string>()
  for (const repoId of legacyRepoIds) {
    const sanityId = legacySanityId(repoId)
    if (sanityId) sanityIdByRepoId.set(repoId, sanityId)
  }

  const existingDocsById = await fetchExistingSanityDocsById([
    ...sanityIdByRepoId.values(),
  ])

  for (const [repoId, mappedSanityId] of sanityIdByRepoId) {
    const doc = existingDocsById.get(mappedSanityId)
    if (!doc) continue

    const sanityRef = toSanityRef(doc._id)

    // A user may already hold a separate subscription keyed on sanityRef
    // directly (e.g. they subscribed again after the content moved, before
    // this backfill ran). Rewriting the legacy row's objectDocumentId to the
    // same sanityRef would then collide with that row on the
    // ("userId", "objectDocumentId") unique constraint -- drop the
    // already-migrated duplicate first and keep the legacy row (updated
    // below), same resolution as migrate-legacy-collection-items.ts.
    const { droppedDuplicates } = await runInScopedTransaction(
      pgdb,
      confirmed,
      async (tx) => {
        const droppedDuplicates: { id: string }[] = await tx.query(
          `
            DELETE FROM subscriptions AS dup
            USING subscriptions AS legacy
            WHERE dup."objectType" = 'Document'
              AND dup."objectDocumentId" = :sanityRef
              AND legacy."objectType" = 'Document'
              AND legacy."objectDocumentId" = :repoId
              AND dup."userId" = legacy."userId"
            RETURNING dup."id"
          `,
          { sanityRef, repoId },
        )

        await tx.public.subscriptions.update(
          { objectType: 'Document', objectDocumentId: repoId },
          { objectDocumentId: sanityRef },
        )

        return { droppedDuplicates }
      },
    )

    console.log(
      `subscriptions: ${repoId} -> ${sanityRef} ` +
        `(dropped ${droppedDuplicates.length} already-migrated duplicate(s))`,
    )
  }
}

runOneOffMigration('migrate-legacy-subscriptions', migrateSubscriptions)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
