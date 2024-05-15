#!/usr/bin/env node
const { createDB } = require('../../lib')

async function main(DATABASE_URL) {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL in .env is missing. You need to add it first.')
    process.exit(1)
  }

  try {
    console.error(`Creating database...`)
    const dbName = await createDB(DATABASE_URL)
    console.error(`Database "${dbName}" created.`)
  } catch (e) {
    console.error('Unable to connect to database. Error:', e.message)
    console.error('This is likely due to a faulty DATABASE_URL.')
    process.exit(1)
  }
}

const { DATABASE_URL } = process.env

main(DATABASE_URL)
