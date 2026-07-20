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

const migrateCollectionItems = async (pgdb: any) => {
  const rows = await pgdb.public.collectionDocumentItems.find({})
  const legacyRepoIds = [
    ...new Set(
      rows
        .map((row: any) => row.repoId)
        .filter((id: string) => id && !isSanityRef(id)),
    ),
  ] as string[]

  console.log(
    `collectionDocumentItems: ${legacyRepoIds.length} distinct legacy repoIds`,
  )

  for (const repoId of legacyRepoIds) {
    const doc = await fetchDocumentByLegacyRepoId(repoId)
    if (!doc) continue

    const sanityRef = toSanityRef(doc._id)
    await pgdb.public.collectionDocumentItems.update(
      { repoId },
      { repoId: sanityRef },
    )
    console.log(`collectionDocumentItems: ${repoId} -> ${sanityRef}`)
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
