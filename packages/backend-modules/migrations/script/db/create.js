#!/usr/bin/env node
const { PgDb } = require('pogi')

const createDatabase = async (database, pgdb) => {
  console.log(`Creating database "${database}"...`)
  await pgdb.run(`CREATE DATABASE "${database}"`)
  console.log(`Database "${database}" created.`)
}

const { DATABASE_URL, NODE_ENV } = process.env
const DEV = NODE_ENV ? NODE_ENV !== 'production' : true

if (!DATABASE_URL) {
  console.error('DATABASE_URL in .env is missing. You need to add it first.')
  process.exit(1)
}

const POSTGRES_URL = new URL(DATABASE_URL)
const dbName = POSTGRES_URL.pathname.substring(1)
POSTGRES_URL.pathname = ''

PgDb.connect({
  application_name: 'setup',
  connectionString: POSTGRES_URL.toString(),
})
  .catch((e) => {
    console.error('Unable to connect to database. Error:', e.message)
    console.log('This is likely due to a faulty DATABASE_URL.')
    process.exit(1)
  })
  .then(async (pgdb) => {
    try {
      await createDatabase(dbName, pgdb)

      if (!DEV) {
        // Return early if script runs not in development
        return pgdb
      }

      // Replace database part in DATABASE_URL with new database
      // const newConnectionString = getConnectionString(DATABASE_URL, name)
      // await Promise.each(paths, createUpdateEnv(newConnectionString))
    } catch (e) {
      console.error(e.message)
    }
    return pgdb
  })
  .then(async (pgdb) => pgdb.close())
