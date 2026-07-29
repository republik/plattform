// One-off, idempotent (safe-to-rerun) tool for proactively normalizing
// subscriptions/bookmarks that still key on a legacy publikator repoId, once
// that content has migrated to Sanity — ahead of eventually retiring the
// Elasticsearch-backed resolution path entirely.
//
// Usage: npx ts-node packages/backend-modules/sanity/scripts/migrate-legacy-references.ts

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
import {
  fetchDocumentByLegacyRepoId,
  toSanityRef,
  isSanityRef,
} from '../lib/document'

const migrateSubscriptions = async (pgdb: any) => {
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
    await pgdb.public.subscriptions.update(
      { objectType: 'Document', objectDocumentId: repoId },
      { objectDocumentId: sanityRef },
    )
    console.log(`subscriptions: ${repoId} -> ${sanityRef}`)
  }
}

// Unlike subscriptions.objectDocumentId (a bare text column), this table keys
// publikator documents via a FK to publikator.repos — so migrating a row means
// moving the id from "repoId" to the separate "sanityId" column, not rewriting
// it in place.
const migrateCollectionItems = async (pgdb: any) => {
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

PgDb.connect()
  .then(async (pgdb: any) => {
    await migrateSubscriptions(pgdb)
    await migrateCollectionItems(pgdb)
  })
  .then(() => {
    process.exit()
  })
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
