/**
 * Independent Postgres LISTEN/NOTIFY consumer for the Typesense search
 * integration. This mirrors the *pattern* used by
 * @orbiting/backend-modules-search/lib/NotifyListener.js (LISTEN change,
 * cascadeUpdateConfig) but is a fully separate, independent implementation:
 * it does not import from, share state with, or modify that file.
 *
 * ## Why this doesn't consume `notifyTableChangeQueue` the way
 * ## NotifyListener.js does
 *
 * NotifyListener.js's flow is: on notification -> SELECT ... FOR UPDATE
 * SKIP LOCKED a batch of matching queue rows -> process them -> DELETE
 * those exact rows. That delete is what makes the queue table workable as
 * a queue: rows are removed once handled.
 *
 * That pattern assumes exactly ONE consumer per logical queue. It is NOT
 * safe for two independent consumers to run the same
 * "claim (lock) + process + delete" cycle against the same physical
 * `notifyTableChangeQueue` table:
 *  - `FOR UPDATE SKIP LOCKED` guarantees no two consumers process the
 *    *same* row concurrently, but it does NOT guarantee both consumers
 *    each get a chance to see every row -- whichever consumer's SELECT
 *    runs first claims (locks) the batch, processes it, and DELETEs it.
 *  - Once a row is deleted by one consumer, it is gone. A second,
 *    independent consumer (this listener) racing against the existing ES
 *    listener would non-deterministically miss rows that the ES listener
 *    claimed and deleted first (and vice versa).
 *  - The trigger payload (see notify_table_change() in
 *    20180511090046-add-notify-table-change-function-up.sql) only carries
 *    `{table, op}` on the NOTIFY channel itself -- no row id. The id is
 *    only available by reading `notifyTableChangeQueue`. So we cannot
 *    avoid touching that table entirely if we want to know *which* row(s)
 *    changed without re-scanning entire source tables.
 *
 * The chosen, safe alternative implemented here: this listener treats
 * `notifyTableChangeQueue` as **read-only**. On a `change` notification (or
 * on a periodic safety-net timer, in case a notification is ever missed
 * across a brief disconnect) it *peeks* (plain SELECT, no locking, no
 * delete) rows newer than a per-table, in-memory watermark
 * (`createdAt > lastSeenAt[table]`), advances the watermark, and uses the
 * returned ids to re-fetch fresh rows directly from the source tables
 * before transforming + upserting into Typesense. It never deletes or
 * locks queue rows, so it cannot race the existing ES listener's delete,
 * and the ES listener remains the sole owner of queue cleanup.
 *
 * Known trade-off (please read before relying on this in a new
 * environment): because we only ever peek, there is a narrow race window
 * where the ES listener could claim + delete a queue row before this
 * listener's peek query executes, causing this listener to miss it. In
 * practice both listeners receive the Postgres NOTIFY at essentially the
 * same time and query immediately, so the window is small, and the
 * periodic safety-net poll (SEARCH_TYPESENSE_LISTENER_POLL_INTERVAL_MS,
 * default 60s) bounds the damage of any single missed event to at most one
 * poll interval, since the row's `(table, op)` unique constraint keeps
 * bumping `createdAt` on repeated writes. This listener's correctness also
 * assumes *some* consumer (today: the ES NotifyListener) keeps deleting
 * queue rows -- if SEARCH_PG_LISTENER is ever turned off while this
 * listener runs alone, `notifyTableChangeQueue` will grow unbounded, since
 * nothing deletes rows anymore. That is a pre-existing characteristic of
 * the shared queue table (it was only ever designed for one consumer), not
 * something introduced by this listener. The robust long-term fix would be
 * a dedicated queue table (and triggers) for this listener, added via a
 * new migration -- out of scope for this change.
 */
import debugFn from 'debug'
import get from 'lodash/get'

import { getClient } from './client'
import {
  getAliasName,
  TypesenseCommentDocument,
  TypesenseUserDocument,
} from './collections'
import { transformComment, makeCommentDeps, CommentRow } from './transform/comment'
import { transformUser, makeUserDeps, UserRow } from './transform/user'

const debug = debugFn('search-typesense:lib:listener')

const POLL_INTERVAL_MS = Number(
  process.env.SEARCH_TYPESENSE_LISTENER_POLL_INTERVAL_MS || 60_000,
)

const QUEUE_BATCH_LIMIT = 10_000

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PgDb = any

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

const maxCreatedAt = (rows: QueueRow[], fallback: Date): Date =>
  rows.reduce((max, row) => (row.createdAt > max ? row.createdAt : max), fallback)

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
        fields: [
          'id',
          'content',
          'userId',
          'discussionId',
          'published',
          'adminUnpublished',
          'createdAt',
        ],
      },
    )

  if (!row) {
    await collection
      .documents(commentId)
      .delete()
      .catch(() => {})
    return
  }

  const doc = await transformComment(row, makeCommentDeps(pgdb))

  if (!doc) {
    await collection
      .documents(commentId)
      .delete()
      .catch(() => {})
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

const upsertOrDeleteUser = async (pgdb: PgDb, userId: string) => {
  const client = getClient()
  const collection = client.collections<TypesenseUserDocument>(
    getAliasName('users'),
  )

  const row: UserRow | null = await pgdb.public.users.findOne(
    { id: userId },
    {
      fields: [
        'id',
        'firstName',
        'lastName',
        'username',
        'biography',
        'statement',
        'hasPublicProfile',
        'createdAt',
      ],
    },
  )

  if (!row) {
    await collection
      .documents(userId)
      .delete()
      .catch(() => {})
    return
  }

  const doc = await transformUser(row, makeUserDeps(pgdb))
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
const reindexByTable: Record<string, (pgdb: PgDb, ids: string[]) => Promise<void>> = {
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

  lastSeenAt[table] = maxCreatedAt(rows, since)

  debug('peeked queue rows', { table, count: rows.length })

  if (directTables.has(table)) {
    const ids = rows.map((row) => row.id)
    await reindexByTable[table]?.(pgdb, ids)
  }

  await applyCascade(pgdb, table, rows)
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
      } catch (err) {
        console.error('search-typesense listener processing error', err)
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
    } catch (err) {
      console.error('search-typesense listener failed to parse payload', err)
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

  const close = async () => {
    closing = true
    clearInterval(pollTimer)
    workQueue.length = 0
    if (runPromise) {
      await runPromise
    }
    await cxt.dedicatedConnectionEnd()
    singleton = null
  }

  return { close }
}

export { start }
