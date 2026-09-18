#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for backfilling "sanityId" onto
// bookmarks/audio-queue/progress rows (collectionDocumentItems) that still
// key on a legacy publikator repoId, once that content has moved to Sanity.
//
// Deliberately a dual-write, not a move: "repoId" is kept, not cleared.
// findDocumentItemsByCollectionNames's default (includeSanity: false) query
// -- what the currently-deployed frontend's User.collectionItems uses --
// filters to `repoId IS NOT NULL`, so clearing it the moment this runs would
// make every migrated bookmark/progress/queue item silently disappear from
// old clients. Keeping repoId set means old queries keep seeing the row
// exactly as before, while adding sanityId alongside it makes it visible to
// the new Sanity-oriented queries too (userCollectionItems,
// userDocumentProgress, userAudioQueue).
//
// Dry-run by default: it reports every change it would make and rolls the
// transaction back. Pass --confirm to actually commit.
//
// Reads narrowly on purpose: this table is large (millions of rows across
// all users' bookmarks/audio-queue/progress), but the ~thousands of
// *distinct* repoIds is what actually drives the work -- loading every row
// up front just to dedupe repoIds in JS previously OOM-killed a one-off
// dyno before it could even log a count. DISTINCT is computed in SQL, and
// each repoId's own rows are fetched (with only the columns this migration
// touches) one repoId at a time inside the loop below.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { fetchDocumentByLegacyRepoId } from '../lib/document'
import { runOneOffMigration } from './lib/runOneOffMigration'

interface CollectionItemRow {
  id: string
  collectionId: string
  userId: string
}

const migrateCollectionItems = async (pgdb: PgDb) => {
  // `sanityId IS NULL` -- not just `repoId IS NOT NULL` -- so a re-run only
  // does work for repoIds that still have at least one un-migrated row.
  // Idempotent already meant "safe to rerun"; this also makes rerunning
  // *cheap*, skipping the Sanity API round trip entirely for the (likely
  // large, growing-over-time) majority of repoIds a previous run already
  // fully migrated.
  const legacyRepoIds: string[] = await pgdb.queryOneColumn(
    `SELECT DISTINCT "repoId" FROM "collectionDocumentItems" WHERE "repoId" IS NOT NULL AND "sanityId" IS NULL`,
  )

  console.log(
    `collectionDocumentItems: ${legacyRepoIds.length} distinct un-migrated legacy repoIds`,
  )

  for (const repoId of legacyRepoIds) {
    const doc = await fetchDocumentByLegacyRepoId(repoId)
    if (!doc) continue

    const sanityId = doc._id.replace(/^drafts\./, '')

    // sanityId: null -- a repoId can reappear here across runs if a new row
    // was added to it since the last migration (e.g. a fresh bookmark), even
    // though most of its rows are already migrated; only touch the ones that
    // still need it.
    const rows: CollectionItemRow[] =
      await pgdb.public.collectionDocumentItems.find(
        { repoId, sanityId: null },
        { fields: ['id', 'collectionId', 'userId'] },
      )

    // A user may already hold a separate, Sanity-only row for the same
    // document in the same collection (e.g. they re-bookmarked it after the
    // content moved, before this backfill ran). The partial unique index
    // would reject setting the same sanityId on the legacy row too, so
    // resolve the conflict by keeping the legacy row -- it's the one old
    // clients still see via repoId -- and dropping the redundant Sanity-only
    // one instead.
    const conflicting: CollectionItemRow[] =
      await pgdb.public.collectionDocumentItems.find(
        { sanityId },
        { fields: ['id', 'collectionId', 'userId'] },
      )

    for (const row of rows) {
      const conflict = conflicting.find(
        (c) => c.collectionId === row.collectionId && c.userId === row.userId,
      )
      if (conflict) {
        await pgdb.public.collectionDocumentItems.delete({ id: conflict.id })
        console.log(
          `collectionDocumentItems: dropped Sanity-only duplicate ${conflict.id} in favor of legacy row ${row.id}`,
        )
      }
      await pgdb.public.collectionDocumentItems.update(
        { id: row.id },
        { sanityId },
      )
      console.log(
        `collectionDocumentItems: ${repoId} -> sanityId ${sanityId} (repoId kept)`,
      )
    }
  }
}

runOneOffMigration('migrate-legacy-collection-items', migrateCollectionItems)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
