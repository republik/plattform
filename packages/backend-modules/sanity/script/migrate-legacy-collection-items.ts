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
// bottleneck, fixed by using fetchDocumentsByIds' batch form.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { fetchDocumentsByIds, legacySanityId } from '../lib/document'
import { runOneOffMigration } from './lib/runOneOffMigration'

// Sanity's `_id in $ids` filter has no problem with large arrays (the client
// switches to POST once the query would exceed a GET URL's length), but
// chunking keeps any one request/response modest and matches the batching
// idiom already used elsewhere in this codebase (e.g.
// search-typesense/script/reindex.ts's ARTICLE_BATCH_SIZE).
const SANITY_LOOKUP_BATCH_SIZE = 500

const chunk = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
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

  // repoIdToSanityId is deterministic and needs no API call -- compute the
  // whole mapping up front, then check which of those ids actually exist in
  // one batch of requests instead of one request per repoId.
  const sanityIdByRepoId = new Map<string, string>()
  for (const repoId of legacyRepoIds) {
    const sanityId = legacySanityId(repoId)
    if (sanityId) sanityIdByRepoId.set(repoId, sanityId)
  }

  const existingDocsById = new Map<string, { _id: string }>()
  for (const idsBatch of chunk(
    [...sanityIdByRepoId.values()],
    SANITY_LOOKUP_BATCH_SIZE,
  )) {
    const docs = await fetchDocumentsByIds(idsBatch)
    for (const doc of docs) existingDocsById.set(doc._id, doc)
  }

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
    // the not-yet-migrated legacy rows.
    const droppedDuplicates: { id: string }[] = await pgdb.query(
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

    const updated: { id: string }[] = await pgdb.query(
      `
        UPDATE "collectionDocumentItems"
        SET "sanityId" = :sanityId
        WHERE "repoId" = :repoId AND "sanityId" IS NULL
        RETURNING "id"
      `,
      { sanityId, repoId },
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
