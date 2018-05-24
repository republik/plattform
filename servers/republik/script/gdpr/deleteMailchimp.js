/**
 * This script deletes emails from mailchimp not present in the
 * local DB, or not having consented to PRIVACY
 *
 * Usage:
 * node script/deleteMailchimp.js
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const rw = require('rw')
const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')
const sleep = require('await-sleep')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_EXPORT_DOWNLOAD_URL
} = process.env

// Interval in seconds stats about bulk progress is printed.
const STATS_INTERVAL_SECS = 2

const hash = (email) =>
  crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex')

const getEmailsFromCSV = (input) =>
  [...new Set(
    input
      .split('\n')
      .slice(1) // remove header
      .map(x => x
        .split(',') // divide columns
        .shift() // keep only email
      )
  )]
    .filter(Boolean)

const fetchAuthenticated = (method, url, request = {}) => {
  const options = {
    method,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')
    },
    ...request
  }
  return fetch(url, options)
    .then(r => r.json())
}

console.log('running deleteMailchimp.js...')
PgDb.connect().then(async pgdb => {
  const dryRun = process.argv[2] === '--dry'
  if (dryRun) {
    console.log("dry run: this won't change anything on mailchimp")
  }

  const stats = { progress: 0, total: 0 }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  let input
  if (MAILCHIMP_EXPORT_DOWNLOAD_URL) {
    console.log('downloading MAILCHIMP_EXPORT_DOWNLOAD_URL...')
    input = await fetch(MAILCHIMP_EXPORT_DOWNLOAD_URL, { method: 'GET' })
      .then(r => r.text())
  } else {
    console.log('reading stdin...')
    input = rw.readFileSync('/dev/stdin', 'utf8')
  }
  if (!input || input.length < 4) {
    throw new Error('You need to provide mailchimp emails as input on stdin')
  }

  const mailchimpEmails = getEmailsFromCSV(input)
  console.log(`#mailchimpEmails: ${mailchimpEmails.length}`)
  stats.total = mailchimpEmails.length

  // load users
  const consentedUsersEmails = await pgdb.queryOneColumn(`
    SELECT
      DISTINCT(LOWER(u.email))
    FROM
      users u
    WHERE
      u.id IN (
        -- have privacy consent
        -- this is only correct as long as PRIVACY is not REVOKEable
        SELECT DISTINCT(c."userId") AS id
        FROM consents c
        WHERE c.policy = 'PRIVACY' AND c.record = 'GRANT'
      ) OR
      u.id IN (
        -- have stripe customer
        SELECT DISTINCT(sc."userId") AS id
        FROM "stripeCustomers" sc
      ) OR
      u.email LIKE '%project-r.construction' OR
      u.email LIKE '%republik.ch'
  `)
  console.log(`#consentedUsersEmails: ${consentedUsersEmails.length}`)

  let operations = []
  let numDeletes = 0

  mailchimpEmails.forEach(email => {
    if (consentedUsersEmails.indexOf(email.toLowerCase()) === -1) {
      operations.push({
        method: 'DELETE',
        path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash(email)}`
      })
      numDeletes += 1
    }
    stats.progress += 1
  })
  console.log(stats)
  clearInterval(statsInterval)
  console.log(`#operations: ${operations.length}`)
  console.log(`#deletes: ${numDeletes}`)

  if (!dryRun) {
    const batchesUrl = `${MAILCHIMP_URL}/3.0/batches`

    const result = await fetchAuthenticated('POST', batchesUrl, {
      body: JSON.stringify({
        operations
      })
    })
    console.log('started:', result)

    let statusResult
    let lastStatus
    do {
      statusResult = await fetchAuthenticated('GET', `${batchesUrl}/${result.id}`)
      const newStatus = statusResult && statusResult.status
      if (lastStatus && lastStatus !== newStatus) {
        console.log('status changed: ', statusResult)
      }
      lastStatus = newStatus
      await sleep(1000)
    } while (!statusResult || statusResult.status !== 'finished')

    /* result is tar :(
    if(lastStatus === 'finished') {
      const summary = await fetch(statusResult.response_body_url, { method: 'GET' })
        .then( r => r.raw() )
      console.log(summary)
    }
    */
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
