const { PgDb } = require('pogi')
const DBMigrate = require('db-migrate')
const path = require('node:path')

function parseDBConnectionString(urlString) {
  const url = new URL(urlString)
  const DATABASE = url.pathname.substring(1)
  url.pathname = '' // remove db name
  const CONNECTION_URI = url.toString()
  return {
    DATABASE,
    CONNECTION_URI,
  }
}

async function createDB(DATABASE_URL, dropOld = false) {
  const { CONNECTION_URI, DATABASE } = parseDBConnectionString(DATABASE_URL)

  const pgdb = await PgDb.connect({
    application_name: 'setup',
    connectionString: CONNECTION_URI,
  })

  if (dropOld) {
    await pgdb.run(`DROP DATABASE IF EXISTS "${DATABASE}"`)
  }

  await pgdb.run(`CREATE DATABASE "${DATABASE}"`)

  await pgdb.close()

  return DATABASE
}

async function seedSampleData(DATABASE_URL) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is missing')
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding test data not allowed in production')
  }

  if (!process.env.DATABASE_SAMPLE_DATA_URL) {
    throw new Error('DB sample data is missing')
  }

  const res = await fetch(process.env.DATABASE_SAMPLE_DATA_URL)
  if (!res.ok) {
    throw new Error(
      `error fetching sample data: ${res.status} - ${res.statusText}`,
    )
  }

  const pgdb = await PgDb.connect({
    application_name: 'setup-seed',
    connectionString: DATABASE_URL,
  })

  await pgdb.run(await res.text())

  await pgdb.close()
}

async function migrateUp(upTo = undefined) {
  const migrator = getMigrator()

  return migrator.up(upTo)
}

async function migrateReset() {
  const migrator = getMigrator()

  return migrator.reset()
}

async function migrateDown(downTo = undefined) {
  const migrator = getMigrator()

  return migrator.down(downTo)
}

function getMigrator() {
  const migrator = DBMigrate.getInstance()

  migrator.setConfigParam(
    'migrations-dir',
    path.resolve(__dirname, '../migrations'),
  )

  return migrator
}

module.exports = {
  createDB,
  migrateUp,
  migrateDown,
  migrateReset,
  seedSampleData,
}
