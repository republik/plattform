#!/usr/bin/env ts-node
/**
 * Full bulk backfill of comments, users, and (opt-in) articles into fresh,
 * dated Typesense collections, followed by an atomic alias swap -- the
 * blue/green pattern mirroring (in behavior, not code)
 * lib/pullElasticsearch.ts in @orbiting/backend-modules-search.
 *
 * comments/users are Postgres-backed and always run by default. articles is
 * Sanity-backed (see lib/sanity/fetchArticles.ts) and opt-in only, via
 * `--only articles` -- republik/studio's functions/sync-search/index.ts
 * remains the source of truth for *incremental* per-publish sync; this is
 * only the bulk backfill path (formerly that repo's own
 * scripts/backfill-search.ts, moved here since it's ops tooling for backend
 * people, not editors).
 *
 * Usage: yarn workspace @orbiting/backend-modules-search-typesense run reindex
 *        -- --only comments,users
 *        -- --only articles
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
  TypesenseArticleDocument,
  TypesenseCommentDocument,
  TypesenseUserDocument,
} from '../lib/collections'
import { fetchSearchableArticles } from '../lib/sanity/fetchArticles'
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

const reindexArticles = async (
  client: Client,
  collectionName: string,
): Promise<{ indexed: number; skipped: number }> => {
  const stats = { indexed: 0, skipped: 0 }

  const docs = await fetchSearchableArticles()

  for (let offset = 0; offset < docs.length; offset += BATCH_SIZE) {
    const batch = docs.slice(offset, offset + BATCH_SIZE)
    const results = await client
      .collections<TypesenseArticleDocument>(collectionName)
      .documents()
      .import(batch, { action: 'upsert' })
    stats.indexed += results.filter((r) => r.success).length
    const failures = results.filter((r) => !r.success)
    if (failures.length > 0) {
      console.error('article import failures', failures.slice(0, 5))
    }
    console.log('reindex articles progress', {
      offset: offset + batch.length,
      total: docs.length,
      ...stats,
    })
  }

  return stats
}

// The default when no --only flag is given -- kept as just comments/users so
// a plain `yarn reindex` stays as fast/scoped as before articles support was
// added. --only articles (or --only comments,users,articles) opts in.
const DEFAULT_KINDS: CollectionKind[] = ['comments', 'users']

const reindexKind = async (
  pgdb: PgDb | undefined,
  client: Client,
  kind: CollectionKind,
) => {
  const aliasName = getAliasName(kind)
  const collectionName = getDatedCollectionName(kind)
  const previousCollectionName = await resolveAlias(client, aliasName)

  console.log(`creating fresh collection "${collectionName}" for "${kind}"`)
  await client.collections().create(getCollectionSchema(kind, collectionName))

  const stats =
    kind === 'comments'
      ? await reindexComments(pgdb as PgDb, client, collectionName)
      : kind === 'users'
        ? await reindexUsers(pgdb as PgDb, client, collectionName)
        : await reindexArticles(client, collectionName)

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
    return DEFAULT_KINDS
  }
  const value = process.argv[onlyArgIndex + 1]
  const kinds = value
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is CollectionKind => ALL_KINDS.includes(s as CollectionKind))
  return kinds.length > 0 ? kinds : DEFAULT_KINDS
}

const main = async () => {
  const kinds = parseOnly()
  // An articles-only run needs no Postgres connectivity at all -- only
  // connect when comments/users are actually being reindexed.
  const needsPgdb = kinds.some((kind) => kind === 'comments' || kind === 'users')
  const pgdb = needsPgdb
    ? await PgDbConnector.connect({
        applicationName: 'backends search-typesense reindex',
      })
    : undefined
  const client = getClient()

  try {
    for (const kind of kinds) {
      await reindexKind(pgdb, client, kind)
    }
  } finally {
    if (pgdb) {
      await PgDbConnector.disconnect(pgdb)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
