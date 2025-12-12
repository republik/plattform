require('@orbiting/backend-modules-env').config()

const debug = require('debug')('search:lib:notifyListener')
const get = require('lodash/get')

const mappings = require('./indices')
const inserts = require('./inserts')
const { getIndexAlias } = require('./utils')

const BULK_SIZE = 100000

const stats = { notifications: 0 }

const cascadeUpdateConfig = {
  credentials: [
    {
      source: 'public.credentials',
      target: 'public.users', // update all users
      via: 'userId', // via credentials.userId
      where: 'id', // where user.id === <via>
    },
    {
      source: 'public.credentials',
      target: 'public.comments', // update all comments
      via: 'userId', // via credentials.userId
      where: 'userId', // where comments.userid === <via>
    },
  ],
  discussions: [
    {
      source: 'public.discussions',
      target: 'public.comments', // update all comments
      via: 'id', // via discussions.id
      where: 'discussionId', // where comments.discussionId === <via>
    },
  ],
  discussionPreferences: [
    {
      source: 'public.discussionPreferences', // update all comments
      target: 'public.comments', // update all comments
      via: 'discussionId', // via discussionPreferences.discussionId
      where: 'discussionId', // where comments.discussionId === <via>
    },
  ],
  commits: [
    {
      source: 'publikator.commits',
      target: 'publikator.repos', // update all repos
      via: 'repoId', // via commits.repoId
      where: 'id', // where repos.id === <via>
    },
  ],
  milestones: [
    {
      source: 'publikator.milestones',
      target: 'publikator.repos', // update all repos
      via: 'repoId', // via milestones.repoId
      where: 'id', // where repos.id === <via>
    },
  ],
  questions: [
    {
      source: 'public.questions',
      target: 'public.questionnaireSubmissions', // update all questionnaireSubmissions
      via: 'questionnaireId', // via questions.questionnaireId
      where: 'questionnaireId', // where questionnaireSubmissions.questionnaireId === <via>
    },
  ],
  users: [
    {
      source: 'public.users',
      target: 'public.comments', // update all comments
      via: 'id', // via users.id
      where: 'userId', // where comments.userid === <via>
    },
    {
      source: 'public.users',
      target: 'public.questionnaireSubmissions', // update all submissions
      via: 'id', // via users.id
      where: 'userId', // where questionnaireSubmissions.questionId === <via>
    },
  ],
}

const updateCascade = async ({ table, rows }, { pgdb, elastic }) => {
  if (cascadeUpdateConfig[table]) {
    debug('found cascade configuration')

    return Promise.all(
      cascadeUpdateConfig[table].map(async (config) => {
        const sources =
          config.via === 'id'
            ? rows.map((row) => ({ id: row.id }))
            : await get(pgdb, config.source).find(
                { id: rows.map((row) => row.id) },
                { fields: [config.via] },
              )

        const sourceIds = sources.map((source) => source[config.via])

        if (sourceIds.length < 1) {
          return
        }

        const updateRows = await get(pgdb, config.target).find(
          { [config.where]: sourceIds },
          { fields: ['id'] },
        )

        return notificationHandler(
          {
            rows: updateRows,
            payload: JSON.stringify({
              table: get(pgdb, config.target).desc.name,
            }),
          },
          { pgdb, elastic },
        )
      }),
    )
  }
}

const notificationHandler = async (
  { rows = false, payload: originalPayload },
  { pgdb, elastic },
) => {
  const notificationHandleId = ++stats.notifications

  const tx = await pgdb.transactionBegin()

  try {
    const { table } = JSON.parse(originalPayload)
    debug('notification received', { table, notificationHandleId })

    if (!rows) {
      rows = await tx.public.notifyTableChangeQueue.query(
        'SELECT * FROM "notifyTableChangeQueue" WHERE "table" = :table LIMIT :limit FOR UPDATE SKIP LOCKED',
        { table, limit: BULK_SIZE },
      )
    }

    if (rows.length === 0) {
      debug('queue noop', { table, notificationHandleId })
      return tx.transactionCommit()
    }

    debug(
      'queue skimmed',
      { table, notificationHandleId },
      { rows: rows.length },
    )

    if (mappings.dict[table]) {
      const { type, name, path } = mappings.dict[table]
      const { insert } = inserts.dict[name]

      const updateIds = rows
        .filter((row) => row.op !== 'DELETE')
        .map((row) => row.id)
      const deleteIds = rows
        .filter((row) => row.op === 'DELETE')
        .map((row) => row.id)

      debug(table, { updateIds, deleteIds })

      await insert({
        indexName: getIndexAlias(name, 'write'),
        type,
        pgdb,
        elastic,
        resource: {
          table: get(tx, path),
          where: { id: updateIds.length > 0 ? updateIds : null },
          delete: deleteIds,
        },
      })
    }

    await updateCascade({ table, rows }, { pgdb, elastic })

    // No delete if rows are provided from outside
    await tx.public.notifyTableChangeQueue.delete({
      id: rows.map((row) => row.id),
    })

    debug('queue done', { table, notificationHandleId })

    await tx.transactionCommit()
  } catch (err) {
    console.error(err)
    await tx.transactionRollback()
  }
}

const run = async (workQueue, context) => {
  while (workQueue.length) {
    const input = workQueue.pop()
    await notificationHandler(input, context)
  }
}

let singleton
const start = async ({ pgdb, elastic }) => {
  if (singleton) {
    // this is just a precautionary measure, the limitation could be lifted
    // without the need to change other code here
    throw new Error('NotifyListener must not be initiated twice!')
  }
  singleton = 'init'

  let closing = false

  let runPromise
  const workQueue = []

  const cxt = await pgdb.dedicatedConnectionBegin()

  await cxt.connection.query('LISTEN change')
  await cxt.connection.on('notification', async (input) => {
    if (closing) {
      return
    }

    workQueue.push(input)

    if (!runPromise) {
      runPromise = run(workQueue, { pgdb, elastic }).then(() => {
        runPromise = null
      })
    }
  })

  debug('listening')

  const close = async () => {
    closing = true
    workQueue.length = 0 // empty queue
    runPromise && (await runPromise)

    await cxt.dedicatedConnectionEnd()

    singleton = null
  }

  return {
    close,
  }
}

module.exports = {
  start,
}
