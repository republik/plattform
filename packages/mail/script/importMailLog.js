#!/usr/bin/env node
/**
 * This script imports mails to mailLog
 *
 * you need to provide MAILLOG_IMPORT_DOWNLOAD_URL via env
 * at the URL a text file containing one email per line is expected.
 *
 * Usage: (run from servers/republik)
 * node ../../packages/mail/script/importMailLog.js TYPE KEYS [--dry]
 * example:
 * node ../../packages/mail/script/importMailLog.js 'membership_giver_prolong_notice' '["lastEndDate:20190115"]' [--dry]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const fetch = require('isomorphic-unfetch')
const uniq = require('lodash/uniq')
const Promise = require('bluebird')

const {
  MAILLOG_IMPORT_DOWNLOAD_URL
} = process.env

console.log('running importMailLog.js...')
PgDb.connect().then(async pgdb => {
  const now = new Date()
  const type = process.argv[2]
  const keys = JSON.parse(process.argv[3])
  const dry = process.argv[4] === '--dry'
  if (!type || !keys) {
    throw new Error('missing input', { type, keys })
  }
  if (!MAILLOG_IMPORT_DOWNLOAD_URL) {
    throw new Error('missing MAILLOG_IMPORT_DOWNLOAD_URL')
  }
  console.log('starting', { type, keys, dry, MAILLOG_IMPORT_DOWNLOAD_URL, now })

  console.log('downloading MAILLOG_IMPORT_DOWNLOAD_URL...')
  const emails = await fetch(MAILLOG_IMPORT_DOWNLOAD_URL, { method: 'GET' })
    .then(r => r.text())
    .then(r => uniq(r.split('\n')))
  console.log(`downloaded ${emails.length} emails`)

  const users = await pgdb.public.users.find({ email: emails })
  console.log(`found ${users.length} users to these emails`)

  if (dry) {
    console.log('dry: skipping insert')
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
