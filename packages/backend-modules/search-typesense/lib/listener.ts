/**
 * Postgres LISTEN/NOTIFY consumer for the Typesense search integration.
 *
 * The `change` notification payload only carries `{table, op}`, the row id
 * is only available in `notifyTableChangeQueue`. On a notification (or on a
 * periodic safety-net timer, in case one is missed across a brief
 * disconnect) this listener peeks rows newer than a per-table, in-memory
 * watermark (`createdAt > lastSeenAt[table]`) and uses the returned ids to
 * re-fetch fresh rows directly from the source tables before transforming
 * and upserting into Typesense. The watermark advances only once that work
 * has succeeded, so a transient Typesense failure gets the batch retried
 * rather than skipped.
 *
 * Rows are not deleted as they are processed. Instead a periodic cleanup
 * (`cleanupQueue`) drops rows older than the retention window, for all
 * tables: nothing else consumes this queue anymore. The retention window
 * bounds how long a failing batch can be retried, so keep it well above
 * the poll interval. The `(id, op)` unique index keeps repeated writes to
 * one row from growing the table between cleanups.
 */
import debugFn from 'debug'
import get from 'lodash/get'
import { logger } from '@orbiting/backend-modules-logger'
import { PgDb } from '@orbiting/backend-modules-types'

import { getClient } from './client'
import {
  getAliasName,
  isNotFound,
  TypesenseCommentDocument,
  TypesenseUserDocument,
} from './collections'
import {
  transformComment,
  makeCommentDeps,
  CommentRow,
  COMMENT_ROW_FIELDS,
} from './transform/comment'
import {
  transformUser,
  makeUserDeps,
  UserRow,
  USER_ROW_FIELDS,
} from './transform/user'

const debug = debugFn('search-typesense:lib:listener')

const DEFAULT_POLL_INTERVAL_MS = 60_000

const parsePollInterval = (raw: string | undefined): number => {
  const parsed = Number(raw)
  if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_POLL_INTERVAL_MS
  }
  return parsed
}

const POLL_INTERVAL_MS = parsePollInterval(
  process.env.SEARCH_TYPESENSE_LISTENER_POLL_INTERVAL_MS,
)

const QUEUE_BATCH_LIMIT = 10_000

const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000
const DEFAULT_QUEUE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

const parsePositiveNumber = (
  raw: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(raw)
  return !raw || !Number.isFinite(parsed) || parsed <= 0 ? fallback : parsed
}

const CLEANUP_INTERVAL_MS = parsePositiveNumber(
  process.env.SEARCH_TYPESENSE_QUEUE_CLEANUP_INTERVAL_MS,
  DEFAULT_CLEANUP_INTERVAL_MS,
)

const QUEUE_RETENTION_MS = parsePositiveNumber(
  process.env.SEARCH_TYPESENSE_QUEUE_RETENTION_MS,
  DEFAULT_QUEUE_RETENTION_MS,
)

interface CascadeRule {
  source: string
  target: string
  via: string
  where: string
}

/**
 * Only the cascades relevant to comments/users (a subset of ES's
 * cascadeUpdateConfig in NotifyListener.js). commits/milestones/questions
 * are intentionally omitted -- out of scope here.
 */
const cascadeUpdateConfig: Record<string, CascadeRule[]> = {
  credentials: [
    {
      source: 'public.credentials',
      target: 'public.users',
      via: 'userId',
      where: 'id',
    },
    {
      source: 'public.credentials',
      target: 'public.comments',
      via: 'userId',
      where: 'userId',
    },
  ],
  discussions: [
    {
      source: 'public.discussions',
      target: 'public.comments',
      via: 'id',
      where: 'discussionId',
    },
  ],
  discussionPreferences: [
    {
      source: 'public.discussionPreferences',
      target: 'public.comments',
      via: 'discussionId',
      where: 'discussionId',
    },
  ],
  users: [
    {
      source: 'public.users',
      target: 'public.comments',
      via: 'id',
      where: 'userId',
    },
  ],
}

// Tables that map 1:1 onto a Typesense collection.
const directTables = new Set(['users', 'comments'])

const interestingTables = Array.from(
  new Set([...Object.keys(cascadeUpdateConfig), ...directTables]),
)

interface QueueRow {
  table: string
  op: 'INSERT' | 'UPDATE' | 'DELETE'
  id: string
  createdAt: Date
}

const peekQueue = async (
  pgdb: PgDb,
  table: string,
  since: Date,
): Promise<QueueRow[]> => {
  return pgdb.public.notifyTableChangeQueue.find(
    { table, 'createdAt >': since },
    {
      fields: ['table', 'op', 'id', 'createdAt'],
      orderBy: { createdAt: 'asc' },
      limit: QUEUE_BATCH_LIMIT,
    },
  )
}

/**
 * Deletes queue rows older than the retention window, whatever their table.
 * Returns the number of deleted rows.
 */
export const cleanupQueue = async (
  pgdb: PgDb,
  retentionMs: number = QUEUE_RETENTION_MS,
  now: Date = new Date(),
): Promise<number> => {
  const cutoff = new Date(now.getTime() - retentionMs)
  const deleted = await pgdb.public.notifyTableChangeQueue.delete({
    'createdAt <': cutoff,
  })
  debug('cleaned up queue rows', { deleted, cutoff })
  return deleted
}

const maxCreatedAt = (rows: QueueRow[], fallback: Date): Date =>
  rows.reduce(
    (max, row) => (row.createdAt > max ? row.createdAt : max),
    fallback,
  )

interface DeletableCollection {
  documents(documentId: string): { delete(): Promise<unknown> }
}

/**
 * Removes a document from a collection.
 *
 * "Already absent" is the expected outcome whenever the source row was never
 * indexable in the first place, so a not-found is swallowed. Any *other*
 * failure is logged and rethrown: processTable only advances its watermark
 * once the work succeeded, so rethrowing is what gets the row retried on the
 * next notification or poll. Swallowing it instead would leave a stale
 * document searchable indefinitely with nothing left to retry it.
 */
const deleteDocument = async (
  collection: DeletableCollection,
  documentId: string,
  reason: string,
): Promise<void> => {
  try {
    await collection.documents(documentId).delete()
  } catch (error) {
    if (isNotFound(error)) {
      debug('delete skipped, document absent', { documentId, reason })
      return
    }
    logger.error(
      { error, documentId, reason },
      'search-typesense failed to delete document',
    )
    throw error
  }
}

// --- Comments ---------------------------------------------------------

const upsertOrDeleteComment = async (pgdb: PgDb, commentId: string) => {
  const client = getClient()
  const collection = client.collections<TypesenseCommentDocument>(
    getAliasName('comments'),
  )

  const row: (CommentRow & { id: string }) | null =
    await pgdb.public.comments.findOne(
      { id: commentId },
      {
        fields: COMMENT_ROW_FIELDS,
      },
    )

  if (!row) {
    await deleteDocument(collection, commentId, 'comment row gone')
    return
  }

  const doc = await transformComment(row, makeCommentDeps(pgdb))

  if (!doc) {
    await deleteDocument(collection, commentId, 'comment not indexable')
    return
  }

  await collection.documents().upsert(doc)
}

const reindexComments = async (pgdb: PgDb, commentIds: string[]) => {
  for (const id of Array.from(new Set(commentIds))) {
    await upsertOrDeleteComment(pgdb, id)
  }
}

// --- Users --------------------------------------------------------------

// Exported for tests: this is the one place that decides whether a user
// document belongs in the index at all.
export const upsertOrDeleteUser = async (pgdb: PgDb, userId: string) => {
  const client = getClient()
  const collection = client.collections<TypesenseUserDocument>(
    getAliasName('users'),
  )

  const row: UserRow | null = await pgdb.public.users.findOne(
    { id: userId },
    {
      fields: USER_ROW_FIELDS,
    },
  )

  if (!row) {
    await deleteDocument(collection, userId, 'user row gone')
    return
  }

  const doc = await transformUser(row, makeUserDeps(pgdb))

  // A profile that stops being public must leave the index -- there is no
  // query-time filter behind it any more (see lib/scopedKey.ts).
  if (!doc) {
    await deleteDocument(collection, userId, 'profile not public')
    return
  }

  await collection.documents().upsert(doc)
}

const reindexUsers = async (pgdb: PgDb, userIds: string[]) => {
  for (const id of Array.from(new Set(userIds))) {
    await upsertOrDeleteUser(pgdb, id)
  }
}

// --- Dispatch + cascade ---------------------------------------------------

// Single table-name -> reindex-fn map, shared by applyCascade (keyed off
// cascadeUpdateConfig's `public.<table>` rule targets) and processTable
// (keyed off the bare queue table name) -- avoids the same comments/users
// branch existing twice.
const reindexByTable: Record<
  string,
  (pgdb: PgDb, ids: string[]) => Promise<void>
> = {
  comments: reindexComments,
  users: reindexUsers,
}

const applyCascade = async (
  pgdb: PgDb,
  table: string,
  rows: QueueRow[],
): Promise<void> => {
  const rules = cascadeUpdateConfig[table]
  if (!rules) {
    return
  }

  for (const rule of rules) {
    const sourceIds =
      rule.via === 'id'
        ? rows.map((row) => row.id)
        : (
            await get(pgdb, rule.source).find(
              { id: rows.map((row) => row.id) },
              { fields: [rule.via] },
            )
          ).map((r: Record<string, string>) => r[rule.via])

    if (sourceIds.length === 0) {
      continue
    }

    const targetRows: { id: string }[] = await get(pgdb, rule.target).find(
      { [rule.where]: sourceIds },
      { fields: ['id'] },
    )

    if (targetRows.length === 0) {
      continue
    }

    const targetIds = targetRows.map((r) => r.id)
    const targetTable = rule.target.replace(/^public\./, '')
    await reindexByTable[targetTable]?.(pgdb, targetIds)
  }
}

const processTable = async (
  pgdb: PgDb,
  table: string,
  lastSeenAt: Record<string, Date>,
): Promise<void> => {
  const since = lastSeenAt[table] || new Date(0)
  const rows = await peekQueue(pgdb, table, since)

  if (rows.length === 0) {
    return
  }

  debug('peeked queue rows', { table, count: rows.length })

  if (directTables.has(table)) {
    const ids = rows.map((row) => row.id)
    await reindexByTable[table]?.(pgdb, ids)
  }

  await applyCascade(pgdb, table, rows)

  // Advanced only after the indexing work above succeeded. If anything threw,
  // the watermark stays put and the next notification or safety-net poll
  // re-peeks the same rows -- the alternative (advancing first) permanently
  // skipped every row in a batch that hit a transient Typesense failure.
  lastSeenAt[table] = maxCreatedAt(rows, since)
}

let singleton: string | null = null

const start = async ({
  pgdb,
}: {
  pgdb: PgDb
}): Promise<{ close: () => Promise<void> }> => {
  if (singleton) {
    throw new Error('search-typesense listener must not be initiated twice!')
  }
  singleton = 'init'

  const lastSeenAt: Record<string, Date> = {}
  // Initialize watermarks to "now" so a fresh listener doesn't try to
  // reprocess the entire historical backlog of a long-lived queue table --
  // full backfills are handled by script/reindex.ts, not this listener.
  const startedAt = new Date()
  interestingTables.forEach((table) => {
    lastSeenAt[table] = startedAt
  })

  let closing = false
  let runPromise: Promise<void> | null = null
  const workQueue: string[] = []

  const runAll = async () => {
    while (workQueue.length && !closing) {
      const table = workQueue.shift() as string
      try {
        await processTable(pgdb, table, lastSeenAt)
      } catch (error) {
        logger.error(
          { error, table },
          'search-typesense listener processing error',
        )
      }
    }
  }

  const schedule = (table: string) => {
    if (closing) {
      return
    }
    workQueue.push(table)
    if (!runPromise) {
      runPromise = runAll().then(() => {
        runPromise = null
      })
    }
  }

  const cxt = await pgdb.dedicatedConnectionBegin()

  await cxt.connection.query('LISTEN change')
  await cxt.connection.on('notification', (input: { payload: string }) => {
    if (closing) {
      return
    }
    try {
      const { table } = JSON.parse(input.payload)
      if (interestingTables.includes(table)) {
        schedule(table)
      }
    } catch (error) {
      logger.error(
        { error },
        'search-typesense listener failed to parse payload',
      )
    }
  })

  debug('listening')

  // Safety-net poll: catches any notification that might have been missed
  // (e.g. during a brief connection drop). Also gives us a first pass
  // shortly after start in case a change was committed in the small window
  // between reading process.env / connecting and issuing LISTEN.
  const pollTimer = setInterval(() => {
    interestingTables.forEach(schedule)
  }, POLL_INTERVAL_MS)

  const runCleanup = async () => {
    try {
      await cleanupQueue(pgdb)
    } catch (error) {
      logger.error(
        { error },
        'search-typesense listener failed to clean up queue',
      )
    }
  }

  // The first pass runs right away so a long-neglected table gets trimmed
  // on the first deploy instead of an hour later.
  void runCleanup()
  const cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS)

  const close = async () => {
    closing = true
    clearInterval(pollTimer)
    clearInterval(cleanupTimer)
    workQueue.length = 0
    if (runPromise) {
      await runPromise
    }
    await cxt.dedicatedConnectionEnd()
    singleton = null
  }

  return { close }
}

export { start, parsePollInterval }
