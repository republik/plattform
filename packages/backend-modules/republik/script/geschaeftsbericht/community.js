#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')
const yargs = require('yargs')

const { writeJson } = require('./lib/output')
const { DEFAULT_FY_FROM, DEFAULT_FY_TO } = require('./lib/dates')
const { EXCLUDED_USER_IDS } = require('./lib/excludedUsers')

const argv = yargs
  .option('from', {
    describe: 'fiscal year start, e.g. 2025-07-01',
    coerce: dayjs,
    default: dayjs(DEFAULT_FY_FROM),
  })
  .option('to', {
    describe: 'fiscal year end, e.g. 2026-07-01',
    coerce: dayjs,
    default: dayjs(DEFAULT_FY_TO),
  })
  .option('out', {
    describe: 'output directory',
    string: true,
    default: `${__dirname}/output`,
  })
  .help()
  .version().argv

// Matches exactly the query used for last year's report, plus excluding
// internal/test accounts (lib/excludedUsers.js).
const QUERY = `
  SELECT
    COUNT(*)::int AS "Debattenbeiträge",
    COUNT(DISTINCT "userId")::int AS "Personen, die debattiert haben"
  FROM comments
  WHERE "createdAt" BETWEEN $1 AND $2
    AND "userId" != ALL($3::uuid[])
`

const run = async () => {
  const from = argv.from.format('YYYY-MM-DD')
  const to = argv.to.format('YYYY-MM-DD')
  console.log(`calculating community stats from ${from} to ${to} …`)

  const pgdb = await PgDb.connect({ applicationName: 'geschaeftsbericht' })

  try {
    const [result] = await pgdb.query(QUERY, [from, to, EXCLUDED_USER_IDS])
    console.log(result)
    writeJson({ from, to, ...result }, argv.out, 'C-community')
  } finally {
    await pgdb.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
