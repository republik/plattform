#!/usr/bin/env ts-node
// One-off, idempotent (safe-to-rerun) tool that adds a "Mit offenen Karten"
// Document subscription for every user subscribed to the article collections
// "Echo" or "An die Verlagsetage" (the studio migration feature-mit-offenen-
// karten moved their articles there). The old subscriptions are left in place:
// nothing will be published to those two collections anymore, so they are
// inert.
//
// Ids (same in every dataset, hardcoded in studio/migrations/
// feature-mit-offenen-karten; each is the uuidv5 of the legacy format repoId):
//   Echo                 e3166e88-4e78-53ca-aa41-bed17fb637ab  republik/format-echo
//   An die Verlagsetage  16fc95a4-7ed2-5fe1-b4a1-c311e64b02a7  republik/format-an-die-verleger
//   Mit offenen Karten   a8e1f6b7-551e-565c-88de-a5f159357035  republik/format-aus-der-redaktion
//
// subscriptions.objectDocumentId holds either the legacy repoId or a
// `sanity:<id>` ref, so both forms of each source are matched. The new row is
// keyed on the `sanity:` ref of the target and copies `filters` from the
// user's oldest source subscription. Users who hold both sources get a single
// new row, and users who already follow the target are skipped
// (ON CONFLICT DO NOTHING on ("userId", "objectDocumentId")), which is also
// what makes a re-run a no-op.
//
// Dry-run by default; pass --confirm to commit. Runs as one transaction (the
// affected row count is small: a few thousand subscriptions at most).
//
// Usage (against the compiled output, `yarn workspace @orbiting/backend-modules-sanity run build`):
//        node packages/backend-modules/sanity/build/script/add-mit-offenen-karten-subscriptions.js
//        node packages/backend-modules/sanity/build/script/add-mit-offenen-karten-subscriptions.js --confirm

import { PgDb } from '@orbiting/backend-modules-types'

import { toSanityRef } from '../lib/document'
import { runInScopedTransaction, runOneOffMigration } from './lib/runOneOffMigration'

const SOURCES = [
  {
    name: 'Echo',
    sanityId: 'e3166e88-4e78-53ca-aa41-bed17fb637ab',
    repoId: 'republik/format-echo',
  },
  {
    name: 'An die Verlagsetage',
    sanityId: '16fc95a4-7ed2-5fe1-b4a1-c311e64b02a7',
    repoId: 'republik/format-an-die-verleger',
  },
]
const TARGET = {
  name: 'Mit offenen Karten',
  sanityId: 'a8e1f6b7-551e-565c-88de-a5f159357035',
}

const addSubscriptions = async (pgdb: PgDb, confirmed: boolean) => {
  const targetRef = toSanityRef(TARGET.sanityId)
  const sourceValues = SOURCES.flatMap((s) => [toSanityRef(s.sanityId), s.repoId])

  const counts: { objectDocumentId: string; count: string }[] = await pgdb.query(
    `
      SELECT "objectDocumentId", count(*) AS count FROM subscriptions
      WHERE "objectType" = 'Document'
        AND ("objectDocumentId" = ANY(:sourceValues) OR "objectDocumentId" = :targetRef)
      GROUP BY 1 ORDER BY 1
    `,
    { sourceValues, targetRef },
  )
  console.log('current subscriptions:')
  for (const row of counts) console.log(`  ${row.objectDocumentId}: ${row.count}`)

  const inserted = await runInScopedTransaction(pgdb, confirmed, async (tx) => {
    const rows: { id: string }[] = await tx.query(
      `
        INSERT INTO subscriptions ("userId", "objectType", "objectDocumentId", "filters")
        SELECT DISTINCT ON ("userId")
          "userId", 'Document', :targetRef, "filters"
        FROM subscriptions
        WHERE "objectType" = 'Document'
          AND "objectDocumentId" = ANY(:sourceValues)
        ORDER BY "userId", "createdAt", "id"
        ON CONFLICT ("userId", "objectDocumentId") DO NOTHING
        RETURNING "id"
      `,
      { sourceValues, targetRef },
    )
    return rows
  })

  console.log(
    `-> ${targetRef} (${TARGET.name}): added ${inserted.length} subscription(s); ` +
      `old Echo / An die Verlagsetage subscriptions left untouched`,
  )
}

runOneOffMigration('add-mit-offenen-karten-subscriptions', addSubscriptions)
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
