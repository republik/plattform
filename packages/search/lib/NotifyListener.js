require('@orbiting/backend-modules-env').config()

const debug = require('debug')('search:lib:notifyListener')
const { Client: PGClient } = require('pg')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')

const mappings = require('./indices')
const inserts = require('../script/inserts')
const { getIndexAlias } = require('./utils')

const BULK_SIZE = 100000

const cascadeUpdateConfig = {
  credentials: [
    {
      table: 'users', // update all users
      via: 'userId', // via credentials.userId
      where: 'id' // where user.id === <via>
    },
    {
      table: 'comments', // update all comments
      via: 'userId', // via credentials.userId
      where: 'userId' // where comments.userid === <via>
    }
  ],
  discussions: [
    {
      table: 'comments', // update all comments
      via: 'id', // via discussions.id
      where: 'discussionId' // where comments.discussionId === <via>
    }
  ],
  discussionPreferences: [
    {
      table: 'comments', // update all comments
      via: 'discussionId', // via discussionPreferences.discussionId
      where: 'discussionId' // where comments.discussionId === <via>
    }
  ]
}

const updateCascade = async function (
  { pogiClient, esClient },
  { table, rows }
) {
  if (cascadeUpdateConfig[table]) {
    debug('found cascade configuration')

    return Promise.all(
      cascadeUpdateConfig[table].map(async function (config) {
        const sources =
          config.via === 'id'
            ? rows.map(row => ({ id: row.id }))
            : await pogiClient.public[table].find({ id: rows.map(row => row.id) })

        const sourceIds = sources.map(source => source[config.via])

        if (sourceIds.length < 1) {
          return
        }

        const updateRows = await pogiClient.public[config.table]
          .find(
            { [config.where]: sourceIds },
            { fields: ['id'] }
          )

        return notificationHandler(
          { pogiClient, esClient },
          {
            rows: updateRows,
            payload: JSON.stringify({ table: config.table })
          }
        )
      })
    )
  }
}

const notificationHandler = async function (
  {
    pogiClient: _pogiClient,
    esClient: _esClient
  } = {},
  { rows = false, payload: originalPayload }
) {
  const notificationHandleId = ++stats.notifications

  const pogiClient = _pogiClient || await PgDb.connect()
  const esClient = _esClient || await Elasticsearch.connect()

  const tx = await pogiClient.transactionBegin()

  try {
    const { table } = JSON.parse(originalPayload)
    debug(
      'notification received',
      { table, notificationHandleId }
    )

    if (!rows) {
      rows = await tx.public.notifyTableChangeQueue.query(
        'SELECT * FROM "notifyTableChangeQueue" WHERE "table" = :table LIMIT :limit FOR UPDATE SKIP LOCKED',
        { table, limit: BULK_SIZE }
      )
    }

    if (rows.length === 0) {
      debug(
        'queue noop',
        { table, notificationHandleId }
      )
      return tx.transactionCommit()
    }

    debug(
      'queue skimmed',
      { table, notificationHandleId },
      { rows: rows.length }
    )

    if (mappings.dict[table]) {
      const { type, name } = mappings.dict[table]
      const { insert } = inserts.dict[name]

      const updateIds = rows
        .filter(row => row.op !== 'DELETE')
        .map(row => row.id)
      const deleteIds = rows
        .filter(row => row.op === 'DELETE')
        .map(row => row.id)

      debug(table, { updateIds, deleteIds })
      console.log(table, { updateIds, deleteIds })

      await insert({
        indexName: getIndexAlias(name, 'write'),
        type,
        pgdb: pogiClient,
        elastic: esClient,
        resource: {
          table: tx.public[table],
          where: { id: updateIds.length > 0 ? updateIds : null },
          delete: deleteIds
        }
      })
    }

    await updateCascade({ pogiClient, esClient }, { table, rows })

    // No delete if rows are provided from outside
    await tx.public.notifyTableChangeQueue
      .delete({ id: rows.map(row => row.id) })

    debug('queue done', { table, notificationHandleId })

    await tx.transactionCommit()
  } catch (err) {
    console.error(err)
    await tx.transactionRollback()
  } finally {
    await Promise.all([
      PgDb.disconnect(pogiClient),
      Elasticsearch.disconnect(esClient)
    ])
  }
}

const stats = { notifications: 0 }

const start = async function () {
  const pgClient = new PGClient({
    connectionString: process.env.DATABASE_URL
  })
  await pgClient.connect()
  await pgClient.on(
    'notification',
    notificationHandler.bind(this, {})
  )
  // Listen to a specific channel
  await pgClient.query('LISTEN change')

  debug('listening')

  const close = async () => {
    // notificationHandler might still be running, connections
    // might still be open after calling close
    await pgClient.end()
  }

  return {
    close
  }
}

module.exports = {
  start
}
