/**
 * This script updates members in mailchimp (in bulk)
 *
 * Usage:
 * cat local/mailchimpSubscribedEmails.txt | node script/fixMailchimp.js [restartCount]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const rw = require('rw')
const fetch = require('isomorphic-unfetch')
const { getInterestsForUser } = require('../modules/crowdfundings/lib/Mail.js')
// const util = require('util')
const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const { authenticate } = require('../lib/Newsletter')
const sleep = require('await-sleep')

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID
} = process.env

// Interval in seconds stats about bulk progress is printed.
const STATS_INTERVAL_SECS = 2

const hash = (email) =>
  crypto
    .createHash('md5')
    .update(email)
    .digest('hex')
    .toLowerCase()

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

const userHasPledgeOrMembership = async ({userId, pgdb}) => {
  if (!userId) {
    return false
  }
  const hasPledge = !!(await pgdb.public.pledges.findFirst({
    userId,
    'status !=': 'DRAFT'
  }))
  if (hasPledge) {
    return hasPledge
  }
  const hasMembership = !!(await pgdb.public.memberships.findFirst({
    userId
  }))
  return hasMembership
}

console.log('running updateMailchimp.js...')
PgDb.connect().then(async pgdb => {
  const stats = { progress: 0, total: 0 }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input || input.length < 4) {
    throw new Error('You need to provide mailchimp emails as input on stdin')
  }
  const mailchimpEmails = [...new Set(
    input
    .split('\n')
    .slice(1) // remove header
    .map(x => x
      .split(',') // divide columns
      .shift()  // keep only email
    )
  )]
    .filter(Boolean)
  console.log(`#mailchimpEmails: ${mailchimpEmails.length}`)
  stats.total = mailchimpEmails.length

  const users = await pgdb.public.users.find({
    email: mailchimpEmails
  })
  console.log(`#users: ${users.length}`)

  let operations = []

  const newsletterName = 'PROJECTR'
  const subscribed = 1

  await Promise.all(mailchimpEmails.map(async (email) => {
    const user = users.find(u => u.email === email)
    const interests = await getInterestsForUser({
      userId: !!user && user.id,
      pgdb
    })
    const mac = authenticate(email, newsletterName, subscribed)
    const base64uMail = base64u.encode(email)
    const subscribeUrl = user && await userHasPledgeOrMembership({ userId: user.id, pgdb })
      ? ''
      : `https://www.republik.ch/mitteilung?type=newsletter-subscription&name=${newsletterName}&subscribed=${subscribed}&context=gdpr&email=${base64uMail}&mac=${mac}`
    operations.push({
      method: 'PUT',
      path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash(email)}`,
      body: JSON.stringify({
        // body <- don't touch, don't change subscription status
        email_address: email,
        status_if_new: 'subscribed',
        interests,
        'merge_fields': {
          'SUB_URL': subscribeUrl
        }
      })
    })
    stats.progress += 1
  }))
  // console.log(util.inspect(operations, {depth: null}))
  console.log(`#operations: ${operations.length}`)

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
  clearInterval(statsInterval)
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
