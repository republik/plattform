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

const notificationHandler = async function (pogiClient, {
  payload: originalPayload,
  ...rest
}) {
  const notificationHandleId = ++stats.notifications

  const tx = await pogiClient.transactionBegin()

  try {
    const { table } = JSON.parse(originalPayload)
    debug(
      'notification received',
      { table, notificationHandleId }
    )

    const rows = await tx.public.notifyTableChangeQueue.query(
      'SELECT * FROM "notifyTableChangeQueue" WHERE "table" = :table LIMIT :limit FOR UPDATE SKIP LOCKED',
      { table, limit: BULK_SIZE }
    )

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

    const updateIds = rows
      .filter(row => row.op !== 'DELETE')
      .map(row => row.id)
    const deleteIds = rows
      .filter(row => row.op === 'DELETE')
      .map(row => row.id)

    const { type, name } = mappings.dict[table]
    const { insert } = inserts.dict[name]

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

    await tx.public.notifyTableChangeQueue
      .delete({ id: rows.map(row => row.id) })

    debug('queue done', { table, notificationHandleId })

    tx.transactionCommit()
  } catch (err) {
    console.error(err)
    tx.transactionRollback()
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

  debug('ready and listening')
}

module.exports = {
  run
}
