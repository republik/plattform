#!/usr/bin/env node
/**
 * This script imports mails to mailLog
 *
 * you need to provide MAILLOG_IMPORT_DOWNLOAD_URL via env
 * at the URL a text file containing one email per line is expected.
 *
 * Usage: (run from servers/republik)
 * node ../../packages/mail/script/importMailLog.js TYPE KEYS [--dry]
 * examples:
 * node ../../packages/mail/script/importMailLog.js 'membership_giver_prolong_notice' '["lastEndDate:20190115"]' [--dry]
 * ./script/prolong/paperInvoice.js --printIds | ../../packages/mail/script/importMailLog.js 'membership_owner_prolong_notice' '["endDate:20190114", "endDate:20190115"]' --dry
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const fetch = require('isomorphic-unfetch')
const uniq = require('lodash/uniq')
const Promise = require('bluebird')
const rw = require('rw')
const isUUID = require('is-uuid')

const {
  MAILLOG_IMPORT_DOWNLOAD_URL
} = process.env

const dry = process.argv[4] === '--dry'

console.log('running importMailLog.js...', { dry })
PgDb.connect().then(async pgdb => {
  const now = new Date()
  const type = process.argv[2]
  const keys = JSON.parse(process.argv[3])
  if (!type || !keys) {
    throw new Error('missing input', { type, keys })
  }

  let input
  if (MAILLOG_IMPORT_DOWNLOAD_URL) {
    console.log('downloading ', MAILLOG_IMPORT_DOWNLOAD_URL)
    input = await fetch(MAILLOG_IMPORT_DOWNLOAD_URL, { method: 'GET' })
      .then(r => r.text())
    console.log(`downloaded`)
  } else {
    console.log('reading stdin')
    input = rw.readFileSync('/dev/stdin', 'utf8')
  }
  if (!input || !input.length) {
    throw new Error('You need to provide input on stdin or via MAILLOG_IMPORT_DOWNLOAD_URL')
  }
  input = uniq(input.split('\n').filter(Boolean))
  console.log('starting', { type, keys, dry, now })

  const ids = input.filter(line => isUUID.v4(line))
  const emails = input.filter(line => !isUUID.v4(line))
  console.log(`${ids.length} ids, ${emails.length} emails`)

  const users = [
    ...ids.length ? await pgdb.public.users.find({ id: ids }) : [],
    ...emails.length ? await pgdb.public.users.find({ email: emails }) : []
  ]
  console.log(`found ${users.length} users`)

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
