require('@orbiting/backend-modules-env').config()

const BULK_SIZE = 100000

const { Client } = require('pg')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const { index } = require('@orbiting/backend-modules-search/lib/indexPgTable')

const esClient = elasticsearch.client()
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
})

const notificationHandler = async function (pogiClient, {
  payload: originalPayload,
  ...rest
}) {
  const notificationHandleId = ++stats.notifications

  try {
    const { table } = JSON.parse(originalPayload)
    console.log('pgNotifyDispatcher notification received', { table, notificationHandleId })

    const tx = await pogiClient.transactionBegin()

    const rows = await tx.public.notifyTableChangeQueue.query(
      'SELECT * FROM "notifyTableChangeQueue" WHERE "table" = :table LIMIT :limit FOR UPDATE SKIP LOCKED',
      { table, limit: BULK_SIZE }
    )

    if (rows.length === 0) {
      console.log('pgNotifyDispatcher queue noop', { table, notificationHandleId })
      return tx.transactionCommit()
    }

    console.log(
      'pgNotifyDispatcher queue skimmed',
      { table, notificationHandleId },
      { rows: rows.length }
    )

    const updateIds = rows
      .filter(row => row.op !== 'DELETE')
      .map(row => row.id)
    const deleteIds = rows
      .filter(row => row.op === 'DELETE')
      .map(row => row.id)

    await index({
      indexName: `republik-${table}`,
      type: table,
      elastic: esClient,
      resource: {
        table: tx.public[table],
        where: { id: updateIds },
        delete: deleteIds
      }
    })

    await tx.public.notifyTableChangeQueue
      .delete({ id: rows.map(row => row.id) })

    // Do transactions
    tx.transactionCommit()

    console.log('pgNotifyDispatcher queue done', { table, notificationHandleId })
  } catch (err) {
    console.log(err)
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

  console.log('pgNotifyDispatcher ready')
}

module.exports = {
  run
}
