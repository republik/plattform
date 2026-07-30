#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool for proactively normalizing
// subscriptions/bookmarks that still key on a legacy publikator repoId, once
// that content has migrated to Sanity — ahead of eventually retiring the
// Elasticsearch-backed resolution path entirely.
//
// Dry-run by default: it reports every change it would make and rolls the
// transaction back. Pass --confirm to actually commit. (The default is
// inverted relative to older scripts like republik/script/gdpr/deleteLocal.js
// because this one deletes rows.)
//
// Usage: yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-references
//        yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-references --confirm
require('@orbiting/backend-modules-env').config()

/* eslint-disable @typescript-eslint/no-var-requires */
const PgDbConnector = require('@orbiting/backend-modules-base/lib/PgDb')
/* eslint-enable @typescript-eslint/no-var-requires */

import { PgDb } from '@orbiting/backend-modules-types'

import {
  fetchDocumentByLegacyRepoId,
  toSanityRef,
  isSanityRef,
} from '../lib/document'

const migrateSubscriptions = async (pgdb: PgDb) => {
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

const main = async () => {
  const confirmed = process.argv.includes('--confirm')
  if (!confirmed) {
    console.log(
      'DRY RUN: reporting what would change, then rolling back. Pass --confirm to commit.',
    )
  }

  const pgdb = await PgDbConnector.connect({
    applicationName: 'backends sanity migrate-legacy-references',
  })

  try {
    // Everything runs inside one transaction so a dry run can simply roll
    // back, and a real run is all-or-nothing.
    const tx = await pgdb.transactionBegin()
    try {
      await migrateSubscriptions(tx)
      await migrateCollectionItems(tx)

      if (confirmed) {
        await tx.transactionCommit()
        console.log('committed')
      } else {
        await tx.transactionRollback()
        console.log('rolled back (dry run)')
      }
    } catch (error) {
      await tx.transactionRollback()
      throw error
    }
  } finally {
    await PgDbConnector.disconnect(pgdb)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
