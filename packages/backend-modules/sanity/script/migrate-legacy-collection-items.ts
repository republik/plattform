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
// Dry-run by default: it reports every change it would make, rolling back
// each repoId's own scoped transaction as it goes (see below). Pass
// --confirm to actually commit.
//
// Reads narrowly on purpose: this table is large (millions of rows across
// all users' bookmarks/audio-queue/progress), but the ~thousands of
// *distinct* repoIds is what actually drives the work -- loading every row
// up front just to dedupe repoIds in JS previously OOM-killed a one-off
// dyno before it could even log a count. DISTINCT is computed in SQL. The
// per-repoId write is set-based SQL too (a DELETE + an UPDATE, each scoped
// to that repoId), not a JS loop over its rows -- a repoId can have
// thousands of rows, and Postgres doing the matching/writing itself avoids
// a DB round trip per row for work it can do in two statements.
//
// Existence is checked in batches, not one Sanity API call per repoId.
// repoIdToSanityId's mapping is a pure computation (no API needed to know
// WHERE a repo's document would live), but it does NOT mean that document
// was ever created: studio's one-time import is publish-state-gated and
// excludes dossiers, duplicate-of-series formats, and all fronts but the
// main magazine one -- so a repoId can deterministically map to an id no
// document exists at, and the import is still ongoing, so "doesn't exist
// yet" is an expected, temporary state for plenty of repoIds. The existence
// check itself is unavoidable; only the "one call per repoId" part was the
// bottleneck, fixed by batching via fetchExistingSanityDocsById (shared with
// migrate-legacy-subscriptions.ts, which has the same shape of problem).
// This step also runs with no open transaction -- the Sanity round trips
// happen before any row lock is taken (see runOneOffMigration.ts).
//
// Each repoId's write is its own short-lived transaction (runInScopedTransaction),
// not part of one transaction spanning the whole run: this table is written
// on essentially every article view, and holding thousands of repoIds'
// worth of row locks for the full run duration would block concurrent
// application writes to any row already touched -- see
// runOneOffMigration.ts for why.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { legacySanityId } from '../lib/document'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'
import { fetchExistingSanityDocsById } from './lib/sanityExistence'

const migrateCollectionItems = async (pgdb: PgDb, confirmed: boolean) => {
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

  // repoIdToSanityId is deterministic and needs no API call -- compute the
  // whole mapping up front, then check which of those ids actually exist in
  // one batch of requests instead of one request per repoId.
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

    const sanityId = doc._id.replace(/^drafts\./, '')

    // A user may already hold a separate, Sanity-only row for the same
    // document in the same collection (e.g. they re-bookmarked it after the
    // content moved, before this backfill ran). The partial unique index
    // would reject setting the same sanityId on the legacy row too, so keep
    // the legacy row -- it's the one old clients still see via repoId -- and
    // drop the redundant Sanity-only one instead. dup/legacy can never be
    // the same row here: dup requires sanityId = :sanityId, legacy requires
    // sanityId IS NULL. Runs before the update below so the join still finds
    // the not-yet-migrated legacy rows. Both statements share one scoped
    // transaction so a dry run's rollback undoes the delete too -- but that
    // transaction is scoped to just this repoId, not the whole run.
    const { droppedDuplicates, updated } = await runInScopedTransaction(
      pgdb,
      confirmed,
      async (tx) => {
        const droppedDuplicates: { id: string }[] = await tx.query(
          `
            DELETE FROM "collectionDocumentItems" AS dup
            USING "collectionDocumentItems" AS legacy
            WHERE dup."sanityId" = :sanityId
              AND legacy."repoId" = :repoId
              AND legacy."sanityId" IS NULL
              AND dup."collectionId" = legacy."collectionId"
              AND dup."userId" = legacy."userId"
            RETURNING dup."id"
          `,
          { sanityId, repoId },
        )

        const updated: { id: string }[] = await tx.query(
          `
            UPDATE "collectionDocumentItems"
            SET "sanityId" = :sanityId
            WHERE "repoId" = :repoId AND "sanityId" IS NULL
            RETURNING "id"
          `,
          { sanityId, repoId },
        )

        return { droppedDuplicates, updated }
      },
    )

    console.log(
      `collectionDocumentItems: ${repoId} -> sanityId ${sanityId} ` +
        `(dropped ${droppedDuplicates.length} Sanity-only duplicate(s), updated ${updated.length} row(s), repoId kept)`,
    )
  }
}

runOneOffMigration('migrate-legacy-collection-items', migrateCollectionItems)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
