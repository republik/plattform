#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')

const cleanedUserMailing = require('../../lib/scheduler/cleanedUserMailing')

const argv = yargs
  .option('dry-run', {
    default: true,
  })
  .option('once-for', {
    default: true,
  })
  .option('from', {
    coerce: dayjs,
    default: dayjs().subtract(30, 'day'),
  })
  .option('to', {
    coerce: dayjs,
    default: dayjs(),
  })
  .help()
  .version().argv

PgDb.connect().then(async (pgdb) => {
  if (argv.dryRun) {
    console.warn('In dry-run mode. Use --no-dry-run to send emails to segment.')
  }

  // in case we want to remind cleaned users who never resubscribed we can turn off onceFor
  if (argv.onceFor) {
    console.log(
      'onceFor set, i.e. mail template will be send to email address only once. Use --no-once-for to switch this off',
    )
  }
  console.log(
    `Fetching cleaned users between ${dayjs(argv.from).format(
      'YYYY-MM-DD',
    )} and ${dayjs(argv.to).format('YYYY-MM-DD')}`,
  )

  await cleanedUserMailing(
    argv.from,
    argv.to,
    { pgdb },
    argv.dryRun,
    argv.onceFor,
  )
  await pgdb.close()
  console.log('Done!')
})
