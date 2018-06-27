require('@orbiting/backend-modules-env').config()

const debug = require('debug')('search:lib:notifyListener')
const { Client } = require('pg')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')

const mappings = require('./indices')
const inserts = require('../script/inserts')
const { getIndexAlias } = require('./utils')

const BULK_SIZE = 100000

const esClient = elasticsearch.client()
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
})

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
  pogiClient,
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

        const updateRows = await pogiClient.public[config.table]
          .find(
            { [config.where]: sourceIds },
            { fields: ['id'] }
          )

        return notificationHandler(
          pogiClient,
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
  pogiClient,
  { rows = false, payload: originalPayload }
) {
  const notificationHandleId = ++stats.notifications

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

      await insert({
        indexName: getIndexAlias(name, 'write'),
        type,
        pgdb: pogiClient,
        elastic: esClient,
        resource: {
          table: tx.public[table],
          where: { id: updateIds },
          delete: deleteIds
        }
      })
    }

    await updateCascade(pogiClient, { table, rows })

    // No delete if rows are provided from outside
    await tx.public.notifyTableChangeQueue
      .delete({ id: rows.map(row => row.id) })

    debug('queue done', { table, notificationHandleId })

    await tx.transactionCommit()
  } catch (err) {
    console.error(err)
    await tx.transactionRollback()
  }
}

const stats = { notifications: 0 }

const run = async function () {
  // Connect to pgogi
  const pogiClient = await PgDb.connect()
  // Connect
  await pgClient.connect()
  // Setup Listener
  await pgClient.on(
    'notification',
    notificationHandler.bind(this, pogiClient)
  )
  // Listen to a specific channel
  await pgClient.query('LISTEN change')

  debug('listening')
}

module.exports = {
  run
}
