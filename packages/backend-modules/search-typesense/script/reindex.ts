#!/usr/bin/env ts-node
/**
 * Full bulk backfill of comments and users into fresh, dated Typesense
 * collections, followed by an atomic alias swap -- the blue/green pattern
 * mirroring (in behavior, not code) lib/pullElasticsearch.ts in
 * @orbiting/backend-modules-search.
 *
 * Does NOT handle "articles" -- that collection has no Postgres-backed
 * source in this repo. It's written by republik/studio's own Sanity
 * Blueprint functions (functions/sync-search/*) and backfilled by that
 * repo's scripts/backfill-search.ts. --only articles is rejected here with
 * a clear error rather than silently doing nothing useful.
 *
 * Usage: yarn workspace @orbiting/backend-modules-search-typesense run reindex
 *        -- --only comments,users
 */
require('@orbiting/backend-modules-env').config()

/* eslint-disable @typescript-eslint/no-var-requires */
// Aliased: `PgDb` itself is the row-handle *type*, imported below.
const PgDbConnector = require('@orbiting/backend-modules-base/lib/PgDb')
/* eslint-enable @typescript-eslint/no-var-requires */

import { Client } from 'typesense'
import { PgDb } from '@orbiting/backend-modules-types'

import { getClient } from '../lib/client'
import {
  ALL_KINDS,
  CollectionKind,
  getAliasName,
  getCollectionSchema,
  getDatedCollectionName,
  resolveAlias,
  TypesenseCommentDocument,
  TypesenseUserDocument,
} from '../lib/collections'
import {
  transformComment,
  makeCommentDeps,
  CommentRow,
  COMMENT_ROW_FIELDS,
} from '../lib/transform/comment'
import {
  transformUser,
  makeUserDeps,
  UserRow,
  USER_ROW_FIELDS,
} from '../lib/transform/user'

const BATCH_SIZE = 1000

const reindexComments = async (
  pgdb: PgDb,
  client: Client,
  collectionName: string,
): Promise<{ indexed: number; skipped: number }> => {
  const stats = { indexed: 0, skipped: 0 }
  const deps = makeCommentDeps(pgdb)

  let offset = 0
  let rows: (CommentRow & { id: string })[]

  do {
    rows = await pgdb.public.comments.find(
      {},
      {
        fields: COMMENT_ROW_FIELDS,
        orderBy: { id: 'asc' },
        limit: BATCH_SIZE,
        offset,
      },
    )

    const docs: TypesenseCommentDocument[] = []
    for (const row of rows) {
      const doc = await transformComment(row, deps)
      if (doc) {
        docs.push(doc)
      } else {
        stats.skipped += 1
      }
    }

    if (docs.length > 0) {
      const results = await client
        .collections<TypesenseCommentDocument>(collectionName)
        .documents()
        .import(docs, { action: 'upsert' })
      stats.indexed += results.filter((r) => r.success).length
      const failures = results.filter((r) => !r.success)
      if (failures.length > 0) {
        console.error('comment import failures', failures.slice(0, 5))
      }
    }

    offset += BATCH_SIZE
    console.log('reindex comments progress', { offset, ...stats })
  } while (rows.length >= BATCH_SIZE)

  return stats
}

const reindexUsers = async (
  pgdb: PgDb,
  client: Client,
  collectionName: string,
): Promise<{ indexed: number; skipped: number }> => {
  const stats = { indexed: 0, skipped: 0 }
  const deps = makeUserDeps(pgdb)

  let offset = 0
  let rows: UserRow[]

  do {
    rows = await pgdb.public.users.find(
      {},
      {
        fields: USER_ROW_FIELDS,
        orderBy: { id: 'asc' },
        limit: BATCH_SIZE,
        offset,
      },
    )

    // Only public profiles are indexed -- transformUser returns null for the
    // rest. No delete pass is needed here (unlike lib/listener.ts): this
    // builds a *fresh* collection and only swaps the alias at the end, so a
    // non-public profile is excluded simply by never being written.
    const transformed = await Promise.all(
      rows.map((row) => transformUser(row, deps)),
    )
    const docs = transformed.filter(
      (doc): doc is TypesenseUserDocument => doc !== null,
    )
    stats.skipped += transformed.length - docs.length

    if (docs.length > 0) {
      const results = await client
        .collections<TypesenseUserDocument>(collectionName)
        .documents()
        .import(docs, { action: 'upsert' })
      stats.indexed += results.filter((r) => r.success).length
      const failures = results.filter((r) => !r.success)
      if (failures.length > 0) {
        console.error('user import failures', failures.slice(0, 5))
      }
    }

    offset += BATCH_SIZE
    console.log('reindex users progress', { offset, ...stats })
  } while (rows.length >= BATCH_SIZE)

  return stats
}

const POSTGRES_BACKED_KINDS: CollectionKind[] = ['comments', 'users']

const reindexKind = async (
  pgdb: PgDb,
  client: Client,
  kind: CollectionKind,
) => {
  if (kind === 'articles') {
    throw new Error(
      '"articles" has no Postgres-backed source in this repo -- backfill it ' +
        "via republik/studio's scripts/backfill-search.ts instead",
    )
  }

  const aliasName = getAliasName(kind)
  const collectionName = getDatedCollectionName(kind)
  const previousCollectionName = await resolveAlias(client, aliasName)

  console.log(`creating fresh collection "${collectionName}" for "${kind}"`)
  await client.collections().create(getCollectionSchema(kind, collectionName))

  const stats =
    kind === 'comments'
      ? await reindexComments(pgdb, client, collectionName)
      : await reindexUsers(pgdb, client, collectionName)

  console.log(`swapping alias "${aliasName}" -> "${collectionName}"`, stats)
  // Atomic on Typesense's side: an alias upsert switches the pointer.
  await client.aliases().upsert(aliasName, { collection_name: collectionName })

  if (previousCollectionName && previousCollectionName !== collectionName) {
    console.log(`deleting previous collection "${previousCollectionName}"`)
    await client
      .collections(previousCollectionName)
      .delete()
      .catch((err: unknown) =>
        console.error(
          `failed to delete previous collection "${previousCollectionName}"`,
          err,
        ),
      )
  }
}

const parseOnly = (): CollectionKind[] => {
  const onlyArgIndex = process.argv.indexOf('--only')
  if (onlyArgIndex === -1) {
    return POSTGRES_BACKED_KINDS
  }
  const value = process.argv[onlyArgIndex + 1]
  const kinds = value
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is CollectionKind => ALL_KINDS.includes(s as CollectionKind))
  return kinds.length > 0 ? kinds : POSTGRES_BACKED_KINDS
}

const main = async () => {
  const pgdb = await PgDbConnector.connect({
    applicationName: 'backends search-typesense reindex',
  })
  const client = getClient()

  const kinds = parseOnly()

  try {
    for (const kind of kinds) {
      await reindexKind(pgdb, client, kind)
    }
  } finally {
    await PgDbConnector.disconnect(pgdb)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
