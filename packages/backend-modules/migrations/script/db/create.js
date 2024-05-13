#!/usr/bin/env node
const { createDB } = require('../../lib')

const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  console.error('DATABASE_URL in .env is missing. You need to add it first.')
  process.exit(1)
}

try {
  createDB(DATABASE_URL)
} catch (e) {
  console.error('Unable to connect to database. Error:', e.message)
  console.log('This is likely due to a faulty DATABASE_URL.')
  process.exit(1)
}
