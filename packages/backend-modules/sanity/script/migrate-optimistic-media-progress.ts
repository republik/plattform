#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for re-keying audio playback
// progress rows (collectionMediaItems) that were written under the wrong
// mediaId by a since-fixed frontend race, back onto the correct key.
//
// Separate migration from migrate-legacy-media-progress.ts, which handles a
// different bug (a repoId-derived key orphaned by the publikator->Sanity
// content migration). This one handles: apps/www's AudioPlayerController
// used to give a just-clicked track's optimistic queue item (before the
// queue mutation round trip resolved a real one) a mediaId of
// `collectionsDocumentId(item)` -- the "sanity:<id>" collectionDocumentItems
// join key -- instead of leaving it unset until the real, server-computed
// mediaId (sanityAudioMediaId(sanityId), see lib/mediaId.ts) arrived. A
// pause/seek/skip landing in that window saved progress under the wrong,
// never-read key. The frontend bug is fixed; this migration is only for the
// rows it already wrote.
//
// The wrong key already embeds the sanityId (it's exactly
// `collectionsDocumentId`'s `sanity:${id}` format), so unlike the legacy
// migration this needs no join against collectionDocumentItems and no Sanity
// existence check -- the correct key is a pure string transform away.
//
// Dry-run by default: it reports every change it would make, rolling back
// each row's own scoped transaction as it goes. Pass --confirm to commit.
//
// A user can hold progress under both keys for the same document (e.g. they
// paused during the optimistic window on one visit, then the real item took
// over and tracked further listening on another). The unique index on
// (collectionId, userId, mediaId) means renaming straight onto the correct
// key would collide in that case, so conflicts are resolved by keeping
// whichever row has the furthest-along "secs" (falling back to the wrongly
// keyed row when neither is ahead, since it's the row about to be renamed
// anyway) and dropping the other -- same policy as
// migrate-legacy-media-progress.ts.
//
// Run this only after the frontend fix has been deployed, so it isn't
// racing against new wrongly-keyed rows still being written.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-optimistic-media-progress
//        yarn workspace @orbiting/backend-modules-sanity run migrate-optimistic-media-progress --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { sanityAudioMediaId } from '../lib/mediaId'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'

// Mirrors document-id.ts's `collectionsDocumentId`'s `sanity:${id}` -- the
// prefix this migration exists to strip back off.
const WRONG_MEDIA_ID_PREFIX = 'sanity:'

const migrateOptimisticMediaProgress = async (
  pgdb: PgDb,
  confirmed: boolean,
) => {
  // Distinct wrong keys, not every row: the same wrong key can recur across
  // many users for a popular article, and the per-key work below is set-based
  // SQL scoped to that key, not a per-row loop.
  const wrongMediaIds: string[] = await pgdb.queryOneColumn(
    `
      SELECT DISTINCT "mediaId"
      FROM "collectionMediaItems"
      WHERE "mediaId" LIKE '${WRONG_MEDIA_ID_PREFIX}%'
    `,
  )

  console.log(
    `collectionMediaItems: ${wrongMediaIds.length} distinct wrongly-keyed mediaId(s) to fix`,
  )

  for (const wrongMediaId of wrongMediaIds) {
    const sanityId = wrongMediaId.slice(WRONG_MEDIA_ID_PREFIX.length)
    const newMediaId = sanityAudioMediaId(sanityId)

    if (wrongMediaId === newMediaId) continue

    // Both statements share one scoped transaction so a dry run's rollback
    // undoes the conflict-resolving delete too -- but that transaction is
    // scoped to just this key, not the whole run (see runOneOffMigration.ts).
    const { droppedConflicts, updated } = await runInScopedTransaction(
      pgdb,
      confirmed,
      async (tx) => {
        // Resolve any (collectionId, userId) that already holds progress
        // under both keys: drop whichever row is less far along, keeping the
        // wrongly-keyed row when neither is ahead (it's the one about to
        // survive the rename below anyway).
        const droppedConflicts: { id: string; mediaId: string }[] =
          await tx.query(
            `
              DELETE FROM "collectionMediaItems" AS loser
              USING "collectionMediaItems" AS wrong, "collectionMediaItems" AS correct
              WHERE wrong."mediaId" = :wrongMediaId
                AND correct."mediaId" = :newMediaId
                AND wrong."collectionId" = correct."collectionId"
                AND wrong."userId" = correct."userId"
                AND loser.id = (
                  CASE
                    WHEN COALESCE((correct.data->>'secs')::numeric, 0)
                       > COALESCE((wrong.data->>'secs')::numeric, 0)
                    THEN wrong.id
                    ELSE correct.id
                  END
                )
              RETURNING loser.id, loser."mediaId"
            `,
            { wrongMediaId, newMediaId },
          )

        // Any wrongly-keyed row that lost its conflict above is already
        // gone; any wrongly-keyed row that won (or had no conflict at all --
        // the fully-stranded case) gets renamed to the correct key, which is
        // now guaranteed free for its (collectionId, userId).
        const updated: { id: string }[] = await tx.query(
          `
            UPDATE "collectionMediaItems"
            SET "mediaId" = :newMediaId, "updatedAt" = now()
            WHERE "mediaId" = :wrongMediaId
            RETURNING "id"
          `,
          { wrongMediaId, newMediaId },
        )

        return { droppedConflicts, updated }
      },
    )

    if (droppedConflicts.length || updated.length) {
      console.log(
        `collectionMediaItems: ${wrongMediaId} -> mediaId ${newMediaId} ` +
          `(dropped ${droppedConflicts.length} conflicting row(s), renamed ${updated.length} row(s))`,
      )
    }
  }
}

runOneOffMigration(
  'migrate-optimistic-media-progress',
  migrateOptimisticMediaProgress,
)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
