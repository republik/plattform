#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const handleFetchResponse = async (res) => {
  if (!res.ok) {
    throw Error(
      `Unable to fetch url "${res.url}" (HTTP Status Code: ${res.status})`,
    )
  }

  return res.text()
}

const handleFetchError = (e) => {
  console.error(e.message)
  console.log('This is likely due to a faulty URL.')

  return false
}

const handleRunError = (e) => {
  console.error('Unable to run SQL statement(s). Error:', e.message)
  console.log(
    'Import may have failed because schema differs or file is corrupted.',
  )
}

const { DATABASE_SAMPLE_DATA_URL } = process.env

const argv = yargs.option('sql-url', {
  alias: 's',
  required: true,
  default: DATABASE_SAMPLE_DATA_URL,
  coerce: (s) => new URL(s),
}).argv

PgDb.connect()
  .then(async (pgdb) => {
    console.log(`Fetching "${argv['sql-url']}"...`)
    const sql = await fetch(argv['sql-url'])
      .then(handleFetchResponse)
      .catch(handleFetchError)

    if (sql) {
      console.log(`Running SQL statement(s)...`)
      await pgdb.run(sql).catch(handleRunError)
    }

    return pgdb
  })
  .then(async (pgdb) => pgdb.close())
