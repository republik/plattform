#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for re-keying audio playback
// progress rows (collectionMediaItems) from the legacy publikator-derived
// mediaId to the Sanity-derived one, once an article has moved to Sanity.
//
// Unlike collectionDocumentItems (bookmarks/queue refs), collectionMediaItems
// has no repoId/sanityId columns to dual-write onto -- mediaId is a single
// opaque text key (see sanity/lib/mediaId.ts). AudioQueueItemRef.mediaId and
// PlayableMedia.userProgress both prefer the Sanity-derived key the moment a
// document's collectionDocumentItems row has a sanityId, so once that
// migration ran (migrate-legacy-collection-items.ts), every progress row still
// stored under the old `base64(`${repoId}/audio`)` key became unreachable --
// reads silently miss and the article looks never-played, even though the
// row (and the user's actual playback position) is still sitting in Postgres.
// This script re-keys those rows in place so existing progress becomes
// visible again under the new mediaId.
//
// Driven off collectionDocumentItems, not a Sanity API call: once a repoId
// has a sanityId there (written by migrate-legacy-collection-items.ts), that
// pairing already establishes the document exists in Sanity -- no need to
// re-check existence here.
//
// Dry-run by default: it reports every change it would make, rolling back
// each pair's own scoped transaction as it goes. Pass --confirm to commit.
//
// A user can hold progress under both keys at once: they may have listened
// before the migration (legacy key) and again afterwards, before this script
// ran (new key). The unique index on (collectionId, userId, mediaId) means
// renaming the legacy row straight to the new key would collide in that case,
// so conflicts are resolved by keeping whichever row has the furthest-along
// "secs" (falling back to neither being ahead, in which case the legacy row
// wins, since it's the row about to be renamed anyway) and dropping the other,
// rather than always preferring one side irrespective of progress.
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-media-progress
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-media-progress --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { sanityAudioMediaId } from '../lib/mediaId'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'

const migrateMediaProgress = async (pgdb: PgDb, confirmed: boolean) => {
  // Distinct (repoId, sanityId) pairs already migrated on the reference
  // table -- the join key between "legacy mediaId" and "new mediaId" below.
  const migratedPairs: { repoId: string; sanityId: string }[] =
    await pgdb.query(
      `
        SELECT DISTINCT "repoId", "sanityId"
        FROM "collectionDocumentItems"
        WHERE "repoId" IS NOT NULL AND "sanityId" IS NOT NULL
      `,
    )

  console.log(
    `collectionDocumentItems: ${migratedPairs.length} distinct migrated (repoId, sanityId) pairs to check for legacy media progress`,
  )

  for (const { repoId, sanityId } of migratedPairs) {
    const legacyMediaId = Buffer.from(`${repoId}/audio`).toString('base64')
    const newMediaId = sanityAudioMediaId(sanityId)

    if (legacyMediaId === newMediaId) continue

    // Both statements share one scoped transaction so a dry run's rollback
    // undoes the conflict-resolving delete too -- but that transaction is
    // scoped to just this pair, not the whole run (see runOneOffMigration.ts).
    const { droppedConflicts, updated } = await runInScopedTransaction(
      pgdb,
      confirmed,
      async (tx) => {
        // Resolve any (collectionId, userId) that already holds progress
        // under both keys: drop whichever row is less far along, keeping the
        // legacy row when neither is ahead (it's the one about to survive
        // the rename below anyway).
        const droppedConflicts: { id: string; mediaId: string }[] =
          await tx.query(
            `
              DELETE FROM "collectionMediaItems" AS loser
              USING "collectionMediaItems" AS legacy, "collectionMediaItems" AS newer
              WHERE legacy."mediaId" = :legacyMediaId
                AND newer."mediaId" = :newMediaId
                AND legacy."collectionId" = newer."collectionId"
                AND legacy."userId" = newer."userId"
                AND loser.id = (
                  CASE
                    WHEN COALESCE((newer.data->>'secs')::numeric, 0)
                       > COALESCE((legacy.data->>'secs')::numeric, 0)
                    THEN legacy.id
                    ELSE newer.id
                  END
                )
              RETURNING loser.id, loser."mediaId"
            `,
            { legacyMediaId, newMediaId },
          )

        // Any legacy row that lost its conflict above is already gone; any
        // legacy row that won (or had no conflict at all) gets renamed to the
        // new key, which is now guaranteed free for its (collectionId, userId).
        const updated: { id: string }[] = await tx.query(
          `
            UPDATE "collectionMediaItems"
            SET "mediaId" = :newMediaId, "updatedAt" = now()
            WHERE "mediaId" = :legacyMediaId
            RETURNING "id"
          `,
          { legacyMediaId, newMediaId },
        )

        return { droppedConflicts, updated }
      },
    )

    if (droppedConflicts.length || updated.length) {
      console.log(
        `collectionMediaItems: ${repoId} -> mediaId ${newMediaId} ` +
          `(dropped ${droppedConflicts.length} conflicting row(s), renamed ${updated.length} row(s))`,
      )
    }
  }
}

runOneOffMigration('migrate-legacy-media-progress', migrateMediaProgress)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
