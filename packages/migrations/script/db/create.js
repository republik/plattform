#!/usr/bin/env node
const { paths } = require('@orbiting/backend-modules-env').config()

const { PgDb } = require('pogi')
const moment = require('moment')
const Promise = require('bluebird')
const fs = require('fs').promises

const createUpdateEnv = (connectionString) => async (path) => {
  try {
    const envData = await fs.readFile(path, 'utf8')
    const updatedEnvData = envData.replace(
      /^(DATABASE_URL=.+)$/gm,
      `#$1\nDATABASE_URL=${connectionString}`,
    )

    if (envData !== updatedEnvData) {
      await fs.writeFile(path, updatedEnvData, 'utf8')
      console.log(`DATABASE_URL in "${path}" updated.`)
    }
  } catch (e) {
    console.log(`
    Unable to update "${path}".
    
    Set DATABASE_URL to: ${connectionString}
    `)
  }
}

const getName = (namespace) =>
  `${namespace || 'backends'}-${moment().format('YYYYMMDD-HHmmss')}`

const stripDatabase = (connectionString) =>
  connectionString.split('/').slice(0, -1).join('/')

const getConnectionString = (connectionString, database) =>
  stripDatabase(connectionString).concat('/' + database)

const createDatabase = async (database, pgdb) => {
  console.log(`Creating database "${database}"...`)
  await pgdb.run(`CREATE DATABASE "${database}"`)
  console.log(`Database "${database}" created.`)
}

const { GITHUB_LOGIN, DATABASE_URL, NODE_ENV } = process.env
const DEV = NODE_ENV ? NODE_ENV !== 'production' : true

if (!DATABASE_URL) {
  console.error('DATABASE_URL in .env is missing. You need to add it first.')
  process.exit(1)
}

PgDb.connect({
  application_name: 'setup',
  connectionString: stripDatabase(DATABASE_URL),
})
  .catch((e) => {
    console.error('Unable to connect to database. Error:', e.message)
    console.log('This is likely due to a faulty DATABASE_URL.')
    process.exit(1)
  })
  .then(async (pgdb) => {
    try {
      const name = getName(GITHUB_LOGIN)
      await createDatabase(name, pgdb)

      if (!DEV) {
        // Return early if script runs not in development
        return pgdb
      }

      // Replace database part in DATABASE_URL with new database
      const newConnectionString = getConnectionString(DATABASE_URL, name)
      await Promise.each(paths, createUpdateEnv(newConnectionString))
    } catch (e) {
      console.error(e.message)
    }
    return pgdb
  })
  .then(async (pgdb) => pgdb.close())
