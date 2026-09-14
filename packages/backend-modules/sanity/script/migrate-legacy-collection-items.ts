#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for moving bookmarks/audio-queue/
// progress rows (collectionDocumentItems) that still key on a legacy
// publikator repoId onto the migrated Sanity document's id, once that
// content has moved to Sanity.
//
// Unlike subscriptions.objectDocumentId (a bare text column), this table
// keys publikator documents via a FK to publikator.repos — so migrating a
// row means moving the id from "repoId" to the separate "sanityId" column,
// not rewriting it in place. Running this is what makes migrated content's
// bookmarks/queue/progress visible to the Sanity-oriented queries
// (userCollectionItems, userDocumentProgress, userAudioQueue), which only
// look at "sanityId"-populated rows.
//
// Dry-run by default: it reports every change it would make and rolls the
// transaction back. Pass --confirm to actually commit.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { fetchDocumentByLegacyRepoId } from '../lib/document'
import { runOneOffMigration } from './lib/runOneOffMigration'

const migrateCollectionItems = async (pgdb: PgDb) => {
  const rows = await pgdb.public.collectionDocumentItems.find({
    'repoId !=': null,
  })
  const legacyRepoIds = [
    ...new Set(rows.map((row: any) => row.repoId).filter(Boolean)),
  ] as string[]

  console.log(
    `collectionDocumentItems: ${legacyRepoIds.length} distinct legacy repoIds`,
  )

  for (const repoId of legacyRepoIds) {
    const doc = await fetchDocumentByLegacyRepoId(repoId)
    if (!doc) continue

    const sanityId = doc._id.replace(/^drafts\./, '')

    // A user may already hold a Sanity-keyed row for the same document in the
    // same collection (e.g. they re-bookmarked it after the content moved).
    // The partial unique index would reject the update, so drop the redundant
    // legacy row instead.
    const conflicting = await pgdb.public.collectionDocumentItems.find({
      sanityId,
    })
    const conflictKeys = new Set(
      conflicting.map((row: any) => `${row.collectionId}:${row.userId}`),
    )

    for (const row of rows.filter((r: any) => r.repoId === repoId)) {
      const key = `${row.collectionId}:${row.userId}`
      if (conflictKeys.has(key)) {
        await pgdb.public.collectionDocumentItems.delete({ id: row.id })
        console.log(`collectionDocumentItems: ${row.id} dropped (duplicate)`)
        continue
      }
      conflictKeys.add(key)
      await pgdb.public.collectionDocumentItems.update(
        { id: row.id },
        { repoId: null, sanityId },
      )
      console.log(`collectionDocumentItems: ${repoId} -> sanityId ${sanityId}`)
    }
  }
}

runOneOffMigration('migrate-legacy-collection-items', migrateCollectionItems)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
