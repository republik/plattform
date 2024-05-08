#!/usr/bin/env node
const { PgDb } = require('pogi')

const createDatabase = async (database, pgdb) => {
  console.log(`Creating database "${database}"...`)
  await pgdb.run(`CREATE DATABASE "${database}"`)
  console.log(`Database "${database}" created.`)
}

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

const { DATABASE_URL, NODE_ENV } = process.env
const DEV = NODE_ENV ? NODE_ENV !== 'production' : true

if (!DATABASE_URL) {
  console.error('DATABASE_URL in .env is missing. You need to add it first.')
  process.exit(1)
}

const { CONNECTION_URI, DATABASE } = parseDBConnectionString(DATABASE_URL)

PgDb.connect({
  application_name: 'setup',
  connectionString: CONNECTION_URI,
})
  .catch((e) => {
    console.error('Unable to connect to database. Error:', e.message)
    console.log('This is likely due to a faulty DATABASE_URL.')
    process.exit(1)
  })
  .then(async (pgdb) => {
    try {
      await createDatabase(DATABASE, pgdb)

      if (!DEV) {
        // Return early if script runs not in development
        return pgdb
      }
    } catch (e) {
      console.error(e.message)
    }
    return pgdb
  })
  .then(async (pgdb) => pgdb.close())
