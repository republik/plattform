#!/usr/bin/env node
/**
 * Script to import mails to mailLog
 *
 * Usage:
 *   node ./packages/mail/script/importMailLog.js --type {type} --keys {keys} [--now {date}] [--no-dry-run]
 *
 * Examples:
 *
 *   node ../../packages/mail/script/importMailLog.js --type membership_giver_prolong_notice --keys '["lastEndDate:20190115"]' --no-dry-run
 *
 *   ./script/prolong/paperInvoice.js --printIds | ../../packages/mail/script/importMailLog.js --type membership_owner_prolong_notice --keys '["endDate:20190114", "endDate:20190115"]' --no-dry-run
 *
 *   cat ~/Desktop/membership_owner_upgrade_monthly.csv | cut -d, -f1 | packages/mail/script/importMailLog.js --type membership_owner_upgrade_monthly --now 2020-07-07T12:00+0200 --no-dry-run
 *
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const uniq = require('lodash/uniq')
const rw = require('rw')
const isUUID = require('is-uuid')
const moment = require('moment')
const Promise = require('bluebird')

const yargs = require('yargs')

const argv = yargs
  .options('type', { required: true })
  .options('keys', { coerce: JSON.parse })
  .options('now', { coerce: moment, default: new Date() })
  .options('dry-run', { default: true })
  .argv

PgDb.connect().then(async pgdb => {
  const { type, keys, now, dryRun } = argv
  console.log('running importMailLog.js...', { dryRun })

  console.log('reading stdin')
  const input = rw.readFileSync('/dev/stdin', 'utf8')

  if (!input || !input.length) {
    throw new Error('You need to provide input on stdin')
  }

  const records = uniq(input.split('\n').filter(Boolean))
  console.log('starting', { type, keys, dryRun, now })

  const ids = records.filter(line => isUUID.v4(line))
  const emails = records.filter(line => !isUUID.v4(line))
  console.log(`${ids.length} ids, ${emails.length} emails`)

  const users = [
    ...ids.length ? await pgdb.public.users.find({ id: ids }) : [],
    ...emails.length ? await pgdb.public.users.find({ email: emails }) : []
  ]
  console.log(`found ${users.length} users`)

  if (dryRun) {
    console.log('dryRun: skipping insert')
  } else {
    // too many rows to insert in one swoosh, thus one by one
    const rows = await Promise.map(
      users,
      ({ id: userId, email }) =>
        pgdb.public.mailLog.insert({
          type,
          userId,
          email,
          keys,
          status: 'SENT',
          result: { status: 'imported' },
          createdAt: now,
          updatedAt: now
        }),
      { concurrency: 20 }
    )
    console.log(`inserted ${rows.length} rows!`)
  }

  console.log('finished!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
